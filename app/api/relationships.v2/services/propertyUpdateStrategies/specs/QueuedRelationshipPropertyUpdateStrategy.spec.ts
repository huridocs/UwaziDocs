import { Queue } from 'api/queue.v2/application/Queue';
import { MemoryQueueAdapter } from 'api/queue.v2/infrastructure/MemoryQueueAdapter';
import { StringJobSerializer } from 'api/queue.v2/infrastructure/StringJobSerializer';
import { QueuedRelationshipPropertyUpdateStrategy } from '../QueuedRelationshipPropertyUpdateStrategy';
import { UpdateRelationshipPropertiesJob } from '../UpdateRelationshipPropertiesJob';

it('should enqueue a job per entity', async () => {
  const adapter = new MemoryQueueAdapter();
  const serializer = StringJobSerializer;
  const queue = new Queue('jobs', adapter, serializer);
  queue.register(UpdateRelationshipPropertiesJob, async () => ({}));
  const strategy = new QueuedRelationshipPropertyUpdateStrategy(queue);

  await strategy.update(['sharedId1', 'sharedId2']);
  const enqueued1 = await queue.peek();
  const enqueued2 = await queue.peek();
  const enqueued3 = await queue.peek();

  expect(enqueued1).toBeInstanceOf(UpdateRelationshipPropertiesJob);
  // @ts-ignore
  expect(enqueued1.entityId).toBe('sharedId1');

  expect(enqueued2).toBeInstanceOf(UpdateRelationshipPropertiesJob);
  // @ts-ignore
  expect(enqueued2.entityId).toBe('sharedId2');

  expect(enqueued3).toBe(null);
});
