/* eslint-disable no-await-in-loop */
import RedisSMQ, { QueueMessage } from 'rsmq';
import Redis, { RedisClient } from 'redis';
import { Repeater } from 'api/utils/Repeater';
import { config } from 'api/config';

export interface TaskMessage {
  tenant: string;
  task: string;
  params?: {
    [key: string]: any;
  };
}

/* eslint-disable camelcase */
export interface ResultsMessage {
  tenant: string;
  task: string;
  params?: {
    [key: string]: any;
  };
  data_url?: string;
  file_url?: string;
}
/* eslint-enable camelcase */

export interface Service {
  serviceName: string;
  processResults?: (results: ResultsMessage) => Promise<Boolean>;
  processRessultsMessageHiddenTime?: number;
}

export class TaskManager {
  redisSMQ: RedisSMQ;

  readonly service: Service;

  readonly taskQueue: string;

  readonly resultsQueue: string;

  private repeater: Repeater | undefined;

  redisClient: RedisClient;

  constructor(service: Service) {
    this.service = service;
    this.taskQueue = `${service.serviceName}_tasks`;
    this.resultsQueue = `${service.serviceName}_results`;
    const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
    this.redisClient = Redis.createClient(redisUrl);
    this.redisSMQ = new RedisSMQ({ client: this.redisClient });

    this.subscribeToEvents();
    this.subscribeToResults();
  }

  subscribeToEvents() {
    this.redisClient.on('error', (error: any | undefined) => {
      if (error && error.code !== 'ECONNREFUSED') {
        throw error;
      }
    });

    this.redisClient.on('connect', () => {
      this.redisSMQ.createQueue({ qname: this.taskQueue }, (err: Error | undefined) => {
        if (err && err.name !== 'queueExists') {
          throw err;
        }
      });
      this.redisSMQ.createQueue({ qname: this.resultsQueue }, (err: Error | undefined) => {
        if (err && err.name !== 'queueExists') {
          throw err;
        }
      });
    });
  }

  async clearQueue() {
    while ((await this.countPendingTasks()) > 0) {
      const message = (await this.redisSMQ.receiveMessageAsync({
        qname: this.taskQueue,
      })) as QueueMessage;

      if (!message.id) {
        break;
      }

      await this.redisSMQ.deleteMessageAsync({
        qname: this.taskQueue,
        id: message.id,
      });
    }
  }

  async countPendingTasks(): Promise<number> {
    const queueAttributes = await this.redisSMQ!.getQueueAttributesAsync({
      qname: this.taskQueue,
    });
    return queueAttributes.msgs;
  }

  private subscribeToResults(): void {
    this.repeater = new Repeater(this.checkForResults.bind(this), 500);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.repeater.start();
  }

  private async checkForResults() {
    if (!this.redisClient?.connected) {
      return;
    }

    const message = (await this.redisSMQ.receiveMessageAsync({
      qname: this.resultsQueue,
      vt: this.service.processRessultsMessageHiddenTime,
    })) as QueueMessage;

    if (message.id && this.service.processResults) {
      const processedMessage = JSON.parse(message.message);

      const processed = await this.service.processResults(processedMessage);
      if (processed) {
        await this.redisSMQ.deleteMessageAsync({
          qname: this.resultsQueue,
          id: message.id,
        });
      }
    }
  }

  async startTask(taskMessage: TaskMessage) {
    if (!this.redisClient.connected) {
      throw new Error('Redis is not connected');
    }

    return this.redisSMQ.sendMessageAsync({
      qname: this.taskQueue,
      message: JSON.stringify(taskMessage),
    });
  }

  async stop() {
    await this.repeater!.stop();
    await this.redisClient.end(true);
  }
}
