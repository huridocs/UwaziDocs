import { ObjectId } from 'mongodb';

import { Property, PropertyTypes } from 'api/templates.v2/model/Property';
import { RelationshipProperty } from 'api/templates.v2/model/RelationshipProperty';
import { RelationshipDBOType } from 'api/relationships.v2/database/schemas/relationshipTypes';
import { MatchQueryNode } from 'api/relationships.v2/model/MatchQueryNode';
import { EntityPointer, Relationship } from 'api/relationships.v2/model/Relationship';
import { LanguageISO6391 } from 'shared/types/commonTypes';
import { TranslationDBO } from 'api/i18n.v2/schemas/TranslationDBO';

const entityPointer = (entity: string): EntityPointer => new EntityPointer(entity);

const getV2FixturesFactoryElements = (idMapper: (id: string) => ObjectId) => ({
  application: {
    property: (name: string, type: PropertyTypes, template: string): Property =>
      new Property(idMapper(name).toString(), type, name, name, idMapper(template).toString()),

    relationshipProperty: (
      name: string,
      template: string,
      query: MatchQueryNode['traversals'],
      denormalizedProperty?: string
    ): RelationshipProperty =>
      new RelationshipProperty(
        idMapper(name).toString(),
        name,
        name,
        query,
        idMapper(template).toString(),
        denormalizedProperty
      ),

    entityPointer,

    relationship: (name: string, from: string, to: string, type: string): Relationship =>
      new Relationship(
        idMapper(name).toString(),
        entityPointer(from),
        entityPointer(to),
        idMapper(type).toString()
      ),
  },

  database: {
    relationshipDBO: (
      name: string,
      from: string,
      to: string,
      type: string
    ): RelationshipDBOType => ({
      _id: idMapper(name),
      from: { entity: from },
      to: { entity: to },
      type: idMapper(type),
    }),

    translationDBO: (
      key: string,
      value: string,
      language: LanguageISO6391,
      context: TranslationDBO['context']
    ): TranslationDBO => ({
      _id: idMapper(`${key}-${language}-${context.id}`),
      key,
      value,
      language,
      context,
    }),
  },

  api: {},
});

export { getV2FixturesFactoryElements };
