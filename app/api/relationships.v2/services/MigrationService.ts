/* eslint-disable max-statements */
/* eslint-disable max-lines */
// eslint-disable-next-line max-classes-per-file
import { stdout } from 'process';

import { IdGenerator } from 'api/common.v2/contracts/IdGenerator';
import { Tenant } from 'api/common.v2/model/Tenant';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';
import { V1RelationshipProperty } from 'api/templates.v2/model/V1RelationshipProperty';
import { objectIndexToArrays, objectIndexToSets } from 'shared/data_utils/objectIndex';
import { RelationshipsDataSource } from '../contracts/RelationshipsDataSource';
import { HubDataSource } from '../contracts/HubDataSource';
import { V1ConnectionsDataSource } from '../contracts/V1ConnectionsDataSource';
import { V1Connection, V1ConnectionDisplayed, V1TextReference } from '../model/V1Connection';
import {
  EntityPointer,
  FilePointer,
  TextReferencePointer,
  Relationship,
  Selection,
} from '../model/Relationship';

const UNUSED_HUB_LIMIT = 10;

const HUB_BATCH_SIZE = 1000;

class RelationshipMatcher {
  readonly fieldLibrary: Record<string, Record<string, Set<string | undefined>>>;

  constructor(v1RelationshipFields: V1RelationshipProperty[]) {
    const groupedByTemplate = objectIndexToArrays(
      v1RelationshipFields,
      field => field.template,
      field => field
    );
    this.fieldLibrary = Object.fromEntries(
      Object.entries(groupedByTemplate).map(([template, fields]) => [
        template,
        objectIndexToSets(
          fields,
          field => field.relationType,
          field => field.content
        ),
      ])
    );
  }

  matches(first: V1ConnectionDisplayed, second: V1ConnectionDisplayed) {
    const sourceEntityTemplate = first.entityTemplate;
    const relationshipType = second.template;
    const targetEntityTemplate = second.entityTemplate;
    return (
      sourceEntityTemplate &&
      targetEntityTemplate &&
      relationshipType &&
      sourceEntityTemplate in this.fieldLibrary &&
      relationshipType in this.fieldLibrary[sourceEntityTemplate] &&
      (this.fieldLibrary[sourceEntityTemplate][relationshipType].has(targetEntityTemplate) ||
        this.fieldLibrary[sourceEntityTemplate][relationshipType].has(undefined))
    );
  }
}

class Statistics {
  total: number = 0;

  used: number = 0;

  totalTextReferences: number = 0;

  usedTextReferences: number = 0;

  errors: number = 0;

  constructor() {
    this.total = 0;
    this.used = 0;
    this.totalTextReferences = 0;
    this.usedTextReferences = 0;
    this.errors = 0;
  }

  add(second: Statistics) {
    this.total += second.total;
    this.used += second.used;
    this.totalTextReferences += second.totalTextReferences;
    this.usedTextReferences += second.usedTextReferences;
    this.errors += second.errors;
  }
}

const logLine = (message: string): void => {
  stdout.write(`${message}\n`);
};

export class MigrationService {
  private idGenerator: IdGenerator;

  private hubsDS: HubDataSource;

  private v1ConnectionsDS: V1ConnectionsDataSource;

  private templatesDS: TemplatesDataSource;

  private relationshipsDS: RelationshipsDataSource;

  private tenant: Tenant;

  constructor(
    idGenerator: IdGenerator,
    hubsDS: HubDataSource,
    v1ConnectionsDS: V1ConnectionsDataSource,
    templatesDS: TemplatesDataSource,
    relationshipsDS: RelationshipsDataSource,
    tenant: Tenant
  ) {
    this.idGenerator = idGenerator;
    this.hubsDS = hubsDS;
    this.v1ConnectionsDS = v1ConnectionsDS;
    this.templatesDS = templatesDS;
    this.relationshipsDS = relationshipsDS;
    this.tenant = tenant;
  }

  private logNoRepair(first: V1Connection, second: V1Connection): void {
    logLine(
      `V2 Relationship Migration Error (tenant:${this.tenant.name})----------------------------------`
    );
    logLine('Could not repair missing file for:');
    logLine(JSON.stringify(first, null, 2));
    logLine(JSON.stringify(second, null, 2));
    logLine('----------------------------------');
  }

  private logUnhandledError(error: Error, first: V1Connection, second: V1Connection): void {
    logLine(
      `V2 Relationship Migration Error (tenant:${this.tenant.name})----------------------------------`
    );
    logLine('Unhandled error encountered at:');
    logLine(error.message);
    logLine('Processed connections:');
    logLine(JSON.stringify(first, null, 2));
    logLine(JSON.stringify(second, null, 2));
    logLine('----------------------------------');
  }

  private async readV1RelationshipFields(): Promise<RelationshipMatcher> {
    const relProps = (await this.templatesDS.getAllProperties().all()).filter(
      p => p instanceof V1RelationshipProperty
    );
    const matcher = new RelationshipMatcher(relProps as V1RelationshipProperty[]);
    return matcher;
  }

  private async gatherHubs(): Promise<void> {
    const cursor = this.v1ConnectionsDS.all();

    let hubIds: Set<string> = new Set();
    await cursor.forEach(async connection => {
      if (connection) hubIds.add(connection.hub);
      if (hubIds.size >= HUB_BATCH_SIZE) {
        await this.hubsDS.insertIds(Array.from(hubIds));
        hubIds = new Set();
      }
    });
    await this.hubsDS.insertIds(Array.from(hubIds));
  }

  static transformReference(reference: V1TextReference): {
    text: string;
    selectionRectangles: Selection[];
  } {
    const { text } = reference;
    const selectionRectangles = reference.selectionRectangles.map(
      sr => new Selection(parseInt(sr.page, 10), sr.top, sr.left, sr.height, sr.width)
    );
    return {
      text,
      selectionRectangles,
    };
  }

  private async tryInferingFile(connection: V1Connection): Promise<string | null | undefined> {
    const similarConnections = this.v1ConnectionsDS.getSimilarConnections(connection);
    const candidate = await similarConnections.find(c => c.hasSameReferenceAs(connection));
    return candidate ? candidate.file : null;
  }

  private async transformPointer(v1Connection: V1Connection): Promise<EntityPointer | null> {
    if (v1Connection.isFilePointer()) {
      return new FilePointer(v1Connection.entity, v1Connection.file);
    }
    if (v1Connection.hasReference()) {
      const { text, selectionRectangles } = MigrationService.transformReference(
        v1Connection.reference
      );
      const inferredFile = v1Connection.file || (await this.tryInferingFile(v1Connection));
      if (!inferredFile) {
        return null;
      }
      return new TextReferencePointer(v1Connection.entity, inferredFile, selectionRectangles, text);
    }
    return new EntityPointer(v1Connection.entity);
  }

  private async transform(
    first: V1Connection,
    second: V1Connection,
    newId: string
  ): Promise<Relationship | null> {
    const sourcePointer = await this.transformPointer(first);
    const targetPointer = await this.transformPointer(second);
    const relationshipType = second.template;
    if (!relationshipType) {
      throw new Error(
        `A Relationship going from ${first.entity} to ${second.entity} has no template.`
      );
    }
    if (!sourcePointer || !targetPointer) {
      return null;
    }
    return new Relationship(newId, sourcePointer, targetPointer, relationshipType);
  }

  // eslint-disable-next-line max-statements
  private async transformHub(
    connections: V1ConnectionDisplayed[],
    matcher: RelationshipMatcher,
    transform: boolean = false
  ): Promise<{
    stats: Statistics;
    transformed: Relationship[];
  }> {
    const stats = new Statistics();
    let unhandledErrorCount = 0;
    stats.total = connections.length;
    stats.totalTextReferences = connections.filter(c => c.file).length;
    const usedConnections: Record<string, V1ConnectionDisplayed> = {};
    const transformed: Relationship[] = [];
    const wasNotAbleToReparMissingFile: [V1Connection, V1Connection][] = [];
    for (let i = 0; i < connections.length; i += 1) {
      const first = connections[i];
      for (let j = 0; j < connections.length; j += 1) {
        const second = connections[j];
        try {
          if (first.id !== second.id && matcher.matches(first, second)) {
            usedConnections[first.id] = first;
            usedConnections[second.id] = second;
            if (transform) {
              // eslint-disable-next-line no-await-in-loop
              const trd = await this.transform(first, second, this.idGenerator.generate());
              if (trd) {
                transformed.push(trd);
              } else {
                wasNotAbleToReparMissingFile.push([first, second]);
                this.logNoRepair(first, second);
              }
            }
          }
        } catch (error) {
          unhandledErrorCount += 1;
          this.logUnhandledError(error, first, second);
        }
      }
    }
    stats.used = Object.keys(usedConnections).length;
    stats.usedTextReferences = Object.values(usedConnections).filter(c => c.file).length;
    stats.errors = wasNotAbleToReparMissingFile.length + unhandledErrorCount;
    return { stats, transformed };
  }

  private async recordUnusedConnections(
    hubsWithUnusedConnections: V1ConnectionDisplayed[][],
    stats: Statistics,
    group: V1ConnectionDisplayed[]
  ): Promise<void> {
    if (hubsWithUnusedConnections.length < UNUSED_HUB_LIMIT && stats.total !== stats.used) {
      hubsWithUnusedConnections.push(group);
    }
  }

  private async writeTransformed(write: boolean, transformed: Relationship[]) {
    if (write && transformed.length > 0) {
      await this.relationshipsDS.insert(transformed);
    }
  }

  private async transformBatch(
    hubIdBatch: string[],
    matcher: RelationshipMatcher,
    stats: Statistics,
    hubsWithUnusedConnections: V1ConnectionDisplayed[][],
    transform: boolean = false,
    write: boolean = false
  ): Promise<void> {
    const connections = await this.v1ConnectionsDS.getConnectedToHubs(hubIdBatch).all();
    const connectionsGrouped = objectIndexToArrays(
      connections,
      connection => connection.hub,
      connection => connection
    );
    const connectionGroups = Array.from(Object.values(connectionsGrouped));
    const transformed: Relationship[] = [];
    for (let i = 0; i < connectionGroups.length; i += 1) {
      const group = connectionGroups[i];
      // eslint-disable-next-line no-await-in-loop
      const {
        stats: groupStats,
        transformed: groupTransformed,
        // eslint-disable-next-line no-await-in-loop
      } = await this.transformHub(group, matcher, transform);
      stats.add(groupStats);
      transformed.push(...groupTransformed);
      // eslint-disable-next-line no-await-in-loop
      await this.recordUnusedConnections(hubsWithUnusedConnections, stats, group);
    }
    await this.writeTransformed(write, transformed);
  }

  private async transformHubs(
    matcher: RelationshipMatcher,
    transform: boolean = false,
    write: boolean = false
  ): Promise<{
    stats: Statistics;
    hubsWithUnusedConnections: V1ConnectionDisplayed[][];
  }> {
    const hubCursor = this.hubsDS.all();
    const stats = new Statistics();
    const hubsWithUnusedConnections: V1ConnectionDisplayed[][] = [];
    await hubCursor.forEachBatch(HUB_BATCH_SIZE, async hubIdBatch =>
      this.transformBatch(hubIdBatch, matcher, stats, hubsWithUnusedConnections, transform, write)
    );
    return { stats, hubsWithUnusedConnections };
  }

  async testOneHub(hubId: string) {
    const matcher = await this.readV1RelationshipFields();

    const connected = await this.v1ConnectionsDS.getConnectedToHubs([hubId]).all();
    const { stats, transformed } = await this.transformHub(connected, matcher, true);

    return {
      total: stats.total,
      used: stats.used,
      totalTextReferences: stats.totalTextReferences,
      usedTextReferences: stats.usedTextReferences,
      errors: stats.errors,
      transformed,
      original: connected,
    };
  }

  async migrate(dryRun: boolean) {
    await this.hubsDS.create();

    const matcher = await this.readV1RelationshipFields();
    await this.gatherHubs();
    const transformAndWrite = !dryRun;
    const transformResult = await this.transformHubs(matcher, transformAndWrite, transformAndWrite);
    const { total, used, totalTextReferences, usedTextReferences, errors } = transformResult.stats;
    const { hubsWithUnusedConnections } = transformResult;

    await this.hubsDS.drop();

    return {
      total,
      used,
      totalTextReferences,
      usedTextReferences,
      errors,
      hubsWithUnusedConnections,
    };
  }
}
