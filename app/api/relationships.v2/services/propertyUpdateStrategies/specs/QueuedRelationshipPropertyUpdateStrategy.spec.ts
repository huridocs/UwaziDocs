import { RedisQueue } from 'api/queue.v2/infrastructure/RedisQueue';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { getConnection, getClient } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoQueueAdapter } from 'api/queue.v2/infrastructure/MongoQueueAdapter';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import { UpdateTemplateRelationshipPropertiesJob } from '../UpdateTemplateRelationshipPropertiesJob';
import { UpdateRelationshipPropertiesJob } from '../UpdateRelationshipPropertiesJob';
import { QueuedRelationshipPropertyUpdateStrategy } from '../QueuedRelationshipPropertyUpdateStrategy';

function createAdapter() {
  return new MongoQueueAdapter(getConnection(), new MongoTransactionManager(getClient()));
}

beforeEach(async () => {
  await testingEnvironment.setUp({});
});

afterAll(async () => {
  await testingEnvironment.tearDown();
});

it('should enqueue a job per entity', async () => {
  const adapter = createAdapter();
  const queue = new RedisQueue('jobs', adapter);
  const strategy = new QueuedRelationshipPropertyUpdateStrategy(queue);

  await strategy.update(['sharedId1', 'sharedId2']);
  const enqueued1 = await queue.peek();
  const enqueued2 = await queue.peek();
  const enqueued3 = await queue.peek();

  expect(enqueued1!.name).toBe(UpdateRelationshipPropertiesJob.name);
  expect(enqueued1!.params.entityIds).toEqual(['sharedId1']);

  expect(enqueued2!.name).toBe(UpdateRelationshipPropertiesJob.name);
  expect(enqueued2!.params.entityIds).toEqual(['sharedId2']);

  expect(enqueued3).toBe(null);
});

it('should enqueue a job for the template', async () => {
  const adapter = createAdapter();
  const queue = new RedisQueue('jobs', adapter);
  const strategy = new QueuedRelationshipPropertyUpdateStrategy(queue);

  await strategy.updateByTemplate('template1');
  const enqueued1 = await queue.peek();
  const enqueued2 = await queue.peek();

  expect(enqueued1!.name).toBe(UpdateTemplateRelationshipPropertiesJob.name);
  expect(enqueued1!.params.templateId).toBe('template1');

  expect(enqueued2).toBe(null);
});
