import { Dispatchable, HeartbeatCallback } from 'api/queue.v2/application/contracts/Dispatchable';
import { DispatchableClass } from 'api/queue.v2/application/contracts/JobsDispatcher';
import {
  UpdateTemplateRelationshipPropertiesJob as createUpdateTemplateRelationshipPropertiesJob,
  UpdateRelationshipPropertiesJob as createUpdateRelationshipPropertiesJob,
} from 'api/relationships.v2/services/service_factories';
import { UpdateRelationshipPropertiesJob } from 'api/relationships.v2/services/propertyUpdateStrategies/UpdateRelationshipPropertiesJob';
import { UpdateTemplateRelationshipPropertiesJob } from 'api/relationships.v2/services/propertyUpdateStrategies/UpdateTemplateRelationshipPropertiesJob';

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class TestJob implements Dispatchable {
  static BATCH_SIZE = 200;

  constructor() {}

  async handleDispatch(_heartbeat: HeartbeatCallback) {
    await new Promise(resolve => {
      setTimeout(resolve, randomIntFromInterval(1000, 2000));
    });
  }
}

export function registerJobs(
  register: <T extends Dispatchable>(
    dispatchable: DispatchableClass<T>,
    factory: (namespace: string) => Promise<T>
  ) => void
) {
  register(UpdateRelationshipPropertiesJob, async () => createUpdateRelationshipPropertiesJob());
  register(UpdateTemplateRelationshipPropertiesJob, createUpdateTemplateRelationshipPropertiesJob);
  register(TestJob, async () => new TestJob());
}
