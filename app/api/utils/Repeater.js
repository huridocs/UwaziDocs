export class Repeater {
  stopSleep = undefined;

  constructor(cb, interval) {
    this.cb = cb;
    this.interval = interval;
    this.stopped = null;
  }

  async sleep() {
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, this.interval);

      this.stopSleep = () => {
        resolve(undefined);
        clearTimeout(timeout);
      };
    });
  }

  async start() {
    while (!this.stopped) {
      // eslint-disable-next-line no-await-in-loop
      await this.cb();
      // eslint-disable-next-line no-await-in-loop
      await this.sleep();
    }

    this.stopped();
  }

  async stop() {
    if (this.stopSleep) {
      this.stopSleep();
    }

    return new Promise(resolve => {
      this.stopped = resolve;
    });
  }
}
