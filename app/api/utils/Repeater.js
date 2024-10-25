import { PromiseManager } from 'api/services/tasksmanager/PromiseManager';

const TEN_SECONDS_IN_MS = 10_000;

export class Repeater {
  constructor(cb, interval, stopPromiseOptions) {
    this.cb = cb;
    this.interval = interval;
    this.stopPromise = new PromiseManager({ timeout: TEN_SECONDS_IN_MS, ...stopPromiseOptions });
    this.delayPromise = new PromiseManager({ timeout: interval });
  }

  async start() {
    while (!this.stopPromise.isPending) {
      // eslint-disable-next-line no-await-in-loop
      await this.cb();
      // eslint-disable-next-line no-await-in-loop
      await this.delayPromise.init();
    }

    this.stopPromise.stop();
  }

  async stop() {
    this.delayPromise.stop();
    await this.stopPromise.init();
  }
}
