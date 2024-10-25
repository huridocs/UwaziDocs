type Props = {
  timeout: number;
  onTimeout?: () => void;
};

export class PromiseManager {
  private _resolve?: Function;

  private timeoutId?: NodeJS.Timeout;

  private onTimeout?: () => void;

  timeout: number;

  constructor({ timeout, onTimeout }: Props) {
    this.timeout = timeout;
    this.onTimeout = onTimeout;
    this._resolve = undefined;
  }

  private setResolve(resolve: Function | undefined) {
    this._resolve = resolve;
  }

  private resolve() {
    if (this._resolve) this._resolve();
    this.setResolve(undefined);
  }

  get isPending() {
    return !!this._resolve;
  }

  stop() {
    if (typeof this.timeoutId !== 'undefined') {
      clearTimeout(this.timeoutId);
    }

    this.resolve();
  }

  async init() {
    const promise = new Promise(resolve => {
      this.setResolve(resolve);

      this.timeoutId = setTimeout(() => {
        this.resolve();
        if (this.onTimeout) this.onTimeout();
      }, this.timeout);
    });

    return promise;
  }
}
