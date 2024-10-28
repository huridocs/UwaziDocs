import Redis from 'redis';
import { config } from 'api/config';

export class RedisSingleton {
  private static instance: RedisSingleton;

  private client: Redis.RedisClient;

  private constructor() {
    this.client = Redis.createClient(`redis://${config.redis.host}:${config.redis.port}`);
  }

  static getInstance(): RedisSingleton {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new RedisSingleton();
    }
    return RedisSingleton.instance;
  }

  getClient(): Redis.RedisClient {
    return this.client;
  }

  disconnect() {
    this.client.quit();
  }
}
