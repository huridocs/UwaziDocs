import { TransactionManager } from 'api/common.v2/contracts/TransactionManager';
import { EntitiesDataSource } from 'api/entities.v2/contracts/EntitiesDataSource';
import { SettingsDataSource } from 'api/settings.v2/contracts/SettingsDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { RelationshipProperty } from 'api/templates.v2/model/RelationshipProperty';
import { RelationshipsDataSource } from '../contracts/RelationshipsDataSource';
import { MatchQueryNode } from '../model/MatchQueryNode';

interface IndexEntitiesCallback {
  (sharedIds: string[]): Promise<void>;
}

export class DenormalizationService {
  private relationshipsDS: RelationshipsDataSource;

  private entitiesDS: EntitiesDataSource;

  private templatesDS: TemplatesDataSource;

  private settingsDS: SettingsDataSource;

  private transactionManager: TransactionManager;

  private indexEntities: IndexEntitiesCallback;

  constructor(
    relationshipsDS: RelationshipsDataSource,
    entitiesDS: EntitiesDataSource,
    templatesDS: TemplatesDataSource,
    settingsDS: SettingsDataSource,
    transactionManager: TransactionManager,
    indexEntitiesCallback: IndexEntitiesCallback
  ) {
    this.relationshipsDS = relationshipsDS;
    this.entitiesDS = entitiesDS;
    this.templatesDS = templatesDS;
    this.settingsDS = settingsDS;
    this.transactionManager = transactionManager;
    this.indexEntities = indexEntitiesCallback;
  }

  private async getCandidateEntities(
    invertQueryCallback: (property: RelationshipProperty) => MatchQueryNode[],
    language: string
  ) {
    const properties = await this.templatesDS.getAllRelationshipProperties().all();
    const entities: { sharedId: string; property: string }[] = [];
    await Promise.all(
      properties.map(async property =>
        Promise.all(
          invertQueryCallback(property).map(async query => {
            await this.relationshipsDS.getByQuery(query, language).forEach(async result => {
              const entity = result.leaf() as { sharedId: string };
              entities.push({
                sharedId: entity.sharedId,
                property: property.name,
              });
            });
          })
        )
      )
    );
    return entities;
  }

  async getCandidateEntitiesForRelationship(_id: string, language: string) {
    const relationship = await this.relationshipsDS.getById([_id]).first();

    if (!relationship) throw new Error('missing relationship');

    const relatedEntities = await this.entitiesDS
      .getByIds([relationship.from, relationship.to])
      .all();

    return this.getCandidateEntities(
      property => property.buildQueryInvertedFromRelationship(relationship, relatedEntities),
      language
    );
  }

  async getCandidateEntitiesForEntity(sharedId: string, language: string) {
    const entity = await this.entitiesDS.getByIds([sharedId]).first();
    if (!entity) throw new Error('missing entity');
    return this.getCandidateEntities(
      property => property.buildQueryInvertedFromEntity(entity),
      language
    );
  }

  async denormalizeForNewRelationships(relationshipIds: string[]) {
    const defaultLanguage = await this.settingsDS.getDefaultLanguageKey();
    const candidates = (
      await Promise.all(
        relationshipIds.map(async id =>
          this.getCandidateEntitiesForRelationship(id, defaultLanguage)
        )
      )
    ).flat();

    await this.entitiesDS.markMetadataAsChanged(candidates);

    this.transactionManager.onCommitted(async () => {
      await this.indexEntities(candidates.map(c => c.sharedId));
    });
  }

  async denormalizeForExistingEntities(entityIds: string[], language: string) {
    const relationshipProperties = await this.templatesDS.getAllRelationshipProperties().all();
    const relationshipPropertyNames = relationshipProperties.map(property => property.name);

    await Promise.all(
      entityIds.map(async sharedId => {
        const entities = await this.entitiesDS.getByIds([sharedId]).all();
        const entity = entities.find(e => e.language === language);
        if (!entity) throw new Error('missing entity');

        await this.entitiesDS.updateDenormalizedTitle(
          relationshipPropertyNames,
          sharedId,
          language,
          entity.title
        );
      })
    );

    const affectedEntities = await this.entitiesDS
      .getByDenormalizedId(relationshipPropertyNames, entityIds)
      .all();

    this.transactionManager.onCommitted(async () => {
      await this.indexEntities(affectedEntities);
    });
  }
}
