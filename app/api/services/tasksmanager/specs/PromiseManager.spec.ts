import waitForExpect from 'wait-for-expect';
import { PromiseManager } from '../PromiseManager';

describe('PromiseManager', () => {
  it('should init a promise and resolve after timeout', async () => {
    const onTimeout = jest.fn();
    const sut = new PromiseManager({ timeout: 1, onTimeout });

    const promise = sut.init();

    expect(sut.isPending).toBeTruthy();
    await expect(promise).resolves.toBeUndefined();
    expect(onTimeout).toHaveBeenCalled();
    expect(sut.isPending).toBeFalsy();
  });

  it('should resolve the promise when sut.stop() is executed', async () => {
    const onTimeout = jest.fn();
    const sut = new PromiseManager({ timeout: 1, onTimeout });

    const promise = sut.init();
    expect(sut.isPending).toBeTruthy();

    sut.stop();

    await expect(promise).resolves.toBeUndefined();
    expect(sut.isPending).toBeFalsy();
    await waitForExpect(() => expect(onTimeout).not.toHaveBeenCalled());
  });
});
