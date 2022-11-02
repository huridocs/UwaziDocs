/* eslint-disable no-await-in-loop */
/* eslint-disable max-statements */
// Run with ts-node, explicitly passing tsconfig, and ignore the compile errors. From the project root:
// yarn ts-node --project ./tsconfig.json --transpile-only ./scripts/relationships.v2/simpleLiftHubs.ts
import process from 'process';

import { MongoClient, Collection, FindCursor, Db, MongoError, ObjectId, OptionalId } from 'mongodb';

import { BulkWriteStream } from '../../app/api/common.v2/database/BulkWriteStream';
import { RelationshipDBOType } from '../../app/api/relationships.v2/database/schemas/relationshipTypes'
import date from '../../app/api/utils/date';
import { objectIndex } from '../../app/shared/data_utils/objectIndex';
import { EntitySchema } from '../../app/shared/types/entityType';
import { Settings } from '../../app/shared/types/settingsType';
import { TemplateSchema } from '../../app/shared/types/templateType';
import { UserSchema } from '../../app/shared/types/userType';
import ID from '../../app/shared/uniqueID';

const print = (text: string) => process.stdout.write(text);

type HubType = {
  _id: ObjectId;
};

type ConnectionType = {
  _id: ObjectId;
  hub: ObjectId;
  entity: string;
  template: ObjectId;
};

type RelTypeType = {
  _id?: ObjectId;
  name: string;
}

const batchsize = 1000;
const temporaryHubCollectionName = '__temporary_hub_collection';
const temporaryEntityCollectionName = '__temporary_entity_collection';
const temporaryRelationshipsCollectionName = '__temporary_relationships_collection';

const getClient = async () => {
  const url = process.env.DBHOST ? `mongodb://${process.env.DBHOST}/` : 'mongodb://localhost/';
  const client = new MongoClient(url);
  await client.connect();

  return client;
};

const getNextBatch = async <T>(cursor: FindCursor<T>, size: number = batchsize) => {
  const returned: T[] = [];
  while ((await cursor.hasNext()) && returned.length < size) {
    returned.push((await cursor.next()) as T);
  }
  return returned;
};

const insertHubs = async (_ids: ObjectId[], hubCollection: Collection<HubType>) => {
  let ids = Array.from(new Set(_ids.map(id => id.toString())));
  const hubs = await hubCollection
    .find({ _id: { $in: ids.map(id => new ObjectId(id)) } })
    .toArray();
  const existing = new Set(hubs.map(({ _id }) => _id.toString()));
  ids = ids.filter(id => !existing.has(id));
  return hubCollection.insertMany(ids.map(id => ({ _id: new ObjectId(id) })));
};

const gatherHubs = async (connections: Collection<ConnectionType>, hubs: Collection<HubType>) => {
  process.stdout.write('Writing temporary hub collection...\n');
  const connectionsCursor = connections.find({}, { projection: { hub: 1 } });

  let toBeInserted: ObjectId[] = [];
  while (await connectionsCursor.hasNext()) {
    const next = (await connectionsCursor.next()) as ConnectionType;
    const { hub } = next;
    toBeInserted.push(hub);
    if (toBeInserted.length > batchsize) {
      await insertHubs(toBeInserted, hubs);
      toBeInserted = [];
    }
  }
  if (toBeInserted.length) await insertHubs(toBeInserted, hubs);
  process.stdout.write('Temporary hub collection done\n.');
};

const createTempCollection = async (db: Db, name: string) => {
  try {
    await db.createCollection(name);
  } catch (error) {
    if (!(error instanceof MongoError)) throw error;
    if (!error.message.endsWith('already exists')) throw error;
    await db.dropCollection(name);
    await db.createCollection(name);
  }
};

const createTempCollections = async (db: Db, names: string[]) => {
  print('Creating temporary collections...\n');
  await Promise.all(names.map(name => createTempCollection(db, name)))
  print('Temporary collections created.\n');
};

const HUBTEMPLATE: TemplateSchema = {
  name: '__former_hub',
  commonProperties: [
    {
      _id: new ObjectId(),
      label: 'Title',
      name: 'title',
      isCommonProperty: true,
      type: 'text',
      prioritySorting: false,
    },
    {
      _id: new ObjectId(),
      label: 'Date added',
      name: 'creationDate',
      isCommonProperty: true,
      type: 'date',
      prioritySorting: false,
    },
    {
      _id: new ObjectId(),
      label: 'Date modified',
      name: 'editDate',
      isCommonProperty: true,
      type: 'date',
      prioritySorting: false,
    },
  ],
  properties: [],
  default: false,
};

const DEFAULT_RELTYPE: Omit<RelTypeType, '_id'> = {
  name: '__no_type',
}

const writeHubTemplate = async (templatesCollection: Collection<TemplateSchema>) => {
  print('Setting up hub template...\n');
  let templates = await templatesCollection.find({ name: HUBTEMPLATE.name }).toArray();
  if (!templates.length) {
    await templatesCollection.insertOne(HUBTEMPLATE);
    templates = await templatesCollection.find({ name: HUBTEMPLATE.name }).toArray();
  }
  const [template] = templates;
  print('Setting up hub template done.\n');
  return template;
};

const writeDefaultRelType = async (db: Db) => {
  print('Setting up default reltype...\n');
  const collection = db.collection<RelTypeType>('relationtypes');
  let reltypes = await collection.find({ name: DEFAULT_RELTYPE.name }).toArray();
  if (!reltypes.length) {
    await collection.insertOne(DEFAULT_RELTYPE);
    reltypes = await collection.find({ name: DEFAULT_RELTYPE.name }).toArray();
  }
  const [reltype] = reltypes;
  print('Setting up default reltype done.\n');
  return reltype;
};

const hubToEntity = (
  hub: HubType,
  sharedId: string,
  language: string,
  template: TemplateSchema,
  user: UserSchema
) => ({
  title: hub._id.toHexString(),
  template: template._id,
  sharedId,
  published: false,
  metadata: {},
  type: 'document',
  user: user._id,
  creationDate: date.currentUTC(),
  editDate: date.currentUTC(),
  language,
  generatedToc: false,
});

const getLanguages = async (db: Db) => {
  const settings = await db.collection<Settings>('settings').findOne({}, { projection: { languages: 1 }}) as Settings;
  const languages = settings.languages.map(l => l.key);
  const defaultLanguage = settings.languages.find(l => l.default).key;
  return { languages, defaultLanguage };
};

const getAnAdmin = async (db: Db) => {
  const admin = await db.collection<UserSchema>('users').findOne({ role: 'admin' });
  if(!admin) throw new Error('Admin not found.');
  return admin;
};


const hubsToRelationships = async (
  hubs: EntitySchema[], 
  connectionsCollection: Collection<ConnectionType>, 
  relationshipsCollection: Collection<RelationshipDBOType>, 
  defaultRelType: RelTypeType
) => {
  const hubIdToSharedId = objectIndex(hubs, h => h.title, h => h.sharedId);
  const hubIds = Object.keys(hubIdToSharedId).map(title => new ObjectId(title));
  const connections = connectionsCollection.find({ hub: { $in: hubIds } });
  const relationshipsWriter = new BulkWriteStream(relationshipsCollection, undefined, batchsize);
  while(!connections.closed){
    const connectionsBatch = await getNextBatch(connections); 
    const newRelationshipBatch = connectionsBatch.map(c => ({
      from: c.entity,
      to: hubIdToSharedId[c.hub.toString()],
      type: c.template || defaultRelType._id,
    }))
    await relationshipsWriter.insertMany(newRelationshipBatch);
  }
  await relationshipsWriter.flush();
};


const liftHubs = async (
  hubsCollection: Collection<HubType>,
  newEntitiesCollection: Collection<EntitySchema>,
  connectionsCollection: Collection<ConnectionType>,
  relationshipsCollection: Collection<RelationshipDBOType>,
  languages: string[],
  template: TemplateSchema,
  user: UserSchema,
  defaultRelType: RelTypeType,
) => {
  print('Writing hub entities and relationships to temporary collections...\n');
  const entityWriter = new BulkWriteStream(newEntitiesCollection, undefined, batchsize);

  const hubs = hubsCollection.find({});
  while (!hubs.closed) {
    const hubBatch = await getNextBatch(hubs);
    const entitybatch = hubBatch.map(hub => {
      const sId = ID();
      return languages.map(language => hubToEntity(hub, sId, language, template, user)); 
    }).flat();
    await entityWriter.insertMany(entitybatch);
    const insertedHubs = await newEntitiesCollection.find({ title: { $in: hubBatch.map(h => h._id.toHexString()) } }).toArray();

    await hubsToRelationships(insertedHubs, connectionsCollection, relationshipsCollection, defaultRelType);
  }
  await entityWriter.flush();
  print('Writing hub entities and relationships to temporary collections done.\n');
};

const copyCollection = async <T extends { [key: string]: any; }>(db: Db, source: Collection<T>, target: Collection<T>) => {
  const sourceCursor = source.find({});
  const targetWriter = new BulkWriteStream(target, undefined, batchsize);
  while (await sourceCursor.hasNext()) {
    const next = await sourceCursor.next() as OptionalId<T>;
    if (next) await targetWriter.insert(next);
  }
  await targetWriter.flush();
};

const finalize = async(db: Db, sourceTargetPairs: [Collection<any>, Collection<any>][], toDrop: Collection<any>[]) => {
  print('Copy from temp to final...\n');
  for(let i = 0; i < sourceTargetPairs.length; i+=1) {
    const [source, target] = sourceTargetPairs[i];
    await copyCollection(db, source, target);
  }
  print('Copy from temp to final done.\n');
  
  print('Dropping temp collections...\n');
  for( let i =0; i < toDrop.length; i+=1 ) {
    const coll = toDrop[i];
    await coll.drop();
  }
  print('Temp collections dropped.\n');
};

const migrate = async () => {
  const client = await getClient();
  const db = client.db(process.env.DATABASE_NAME || 'uwazi_development');
  const { languages, defaultLanguage } = await getLanguages(db);
  const adminUser = await getAnAdmin(db);
  
  await createTempCollections(db, [temporaryHubCollectionName, temporaryRelationshipsCollectionName,  temporaryEntityCollectionName]);

  const hubsCollection = db.collection<HubType>(temporaryHubCollectionName);
  const newEntitiesCollection = db.collection<EntitySchema>(temporaryEntityCollectionName);
  const templatesCollection = db.collection<TemplateSchema>('templates');
  const entitiesCollection = db.collection<EntitySchema>('entities');
  const connectionsCollection = db.collection<ConnectionType>('connections');
  const relationshipsCollection = db.collection<RelationshipDBOType>('relationships');
  const tempRelationshipsCollection = db.collection<RelationshipDBOType>(temporaryRelationshipsCollectionName);

  await gatherHubs(connectionsCollection, hubsCollection);

  const hubtemplate = await writeHubTemplate(templatesCollection);
  const defaultReltype = await writeDefaultRelType(db);
  await liftHubs(
    hubsCollection,
    newEntitiesCollection,
    connectionsCollection,
    tempRelationshipsCollection,
    languages,
    hubtemplate,
    adminUser,
    defaultReltype
  );

  await finalize(
    db, 
    [
      [newEntitiesCollection, entitiesCollection], 
      [tempRelationshipsCollection, relationshipsCollection]
    ], 
    [newEntitiesCollection, tempRelationshipsCollection, hubsCollection]
  );

  await client.close();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
migrate();
