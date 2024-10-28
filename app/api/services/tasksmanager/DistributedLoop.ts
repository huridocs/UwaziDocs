import Redis from 'redis';
import Redlock from 'redlock';
import { handleError } from 'api/utils/handleError';
import { Logger } from 'api/log.v2/contracts/Logger';
import { DefaultLogger } from 'api/log.v2/infrastructure/StandardLogger';
import { PromiseManager } from './PromiseManager';

const TEN_SECONDS_IN_MS = 10_000;

export type OptionsProps = {
  maxLockTime?: number;
  delayTimeBetweenTasks?: number;
  retryDelay?: number;
  port?: number;
  host?: string;
  stopTimeout?: number;
};

export class DistributedLoop {
  private lockName: string;

  private task: () => Promise<void>;

  private redlock: Redlock;

  private redisClient: Redis.RedisClient;

  private maxLockTime: number;

  private retryDelay: number;

  private port: number;

  private host: string;

  taskDelayPromise: PromiseManager;

  stopPromise: PromiseManager;

  constructor(
    lockName: string,
    task: () => Promise<void>,
    {
      maxLockTime = 2000,
      delayTimeBetweenTasks = 1000,
      retryDelay = 200,
      port = 6379,
      host = 'localhost',
      stopTimeout = TEN_SECONDS_IN_MS,
    }: OptionsProps,
    private logger: Logger = DefaultLogger()
  ) {
    this.maxLockTime = maxLockTime;
    this.retryDelay = retryDelay;
    this.lockName = `locks:${lockName}`;
    this.task = task;
    this.port = port;
    this.host = host;
    this.redisClient = Redis.createClient(`redis://${this.host}:${this.port}`);
    this.redlock = new Redlock([this.redisClient], {
      retryJitter: 0,
      retryDelay: this.retryDelay,
    });
    this.taskDelayPromise = new PromiseManager({ timeout: delayTimeBetweenTasks });
    this.stopPromise = new PromiseManager({
      timeout: stopTimeout,
      onTimeout: () => this.logStopTimeoutMessage(),
    });
  }

  start() {
    // eslint-disable-next-line no-void
    void this.lockTask();
  }

  async runTask() {
    try {
      await this.task();
    } catch (error) {
      handleError(error, { useContext: false });
    }

    await this.taskDelayPromise.init();
  }

  private logStopTimeoutMessage() {
    this.logger.info(
      `The task ${this.lockName} tried to be stopped and reached stop timeout of ${this.stopPromise.timeout} milliseconds`
    );
  }

  async stop() {
    this.taskDelayPromise.stop();
    await this.stopPromise.init();
    await this.redlock.quit();
    this.redisClient.end(true);
  }

  async lockTask(): Promise<void> {
    try {
      const lock = await this.redlock.lock(
        this.lockName,
        this.maxLockTime + this.taskDelayPromise.timeout
      );

      if (this.stopPromise.isPending) {
        this.stopPromise.stop();
        return;
      }

      await this.runTask();
      await lock.unlock();
    } catch (error) {
      if (error instanceof Error && error.name !== 'LockError') {
        throw error;
      }
    }

    // eslint-disable-next-line no-void
    void this.lockTask();
  }
}
