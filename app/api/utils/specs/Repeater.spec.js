/* eslint-disable max-statements */
import waitForExpect from 'wait-for-expect';
import { Repeater } from '../Repeater';

const createTaskMock = () => {
  const pending = [];
  let resolveLast;
  let rejectLast;
  const resolveAll = () => pending.forEach(resolve => resolve());

  const task = jest.fn().mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        pending.push(resolve);
        resolveLast = resolve;
        rejectLast = reject;
      })
  );

  return {
    task,
    pending,
    resolveLast,
    rejectLast,
    resolveAll,
  };
};

describe('Repeater', () => {
  let callbackOne;
  let callbackTwo;

  let repeaterOne;
  let repeaterTwo;

  function advanceTime(time) {
    jest.advanceTimersByTime(time);
    return new Promise(resolve => {
      setImmediate(resolve);
    });
  }

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.useFakeTimers('legacy');

    callbackOne = jest.fn().mockImplementation(() => Promise.resolve());
    callbackTwo = jest.fn().mockImplementation(() => Promise.resolve());
  });

  it('should be able to have two independant repeaters', async () => {
    repeaterOne = new Repeater(callbackOne, 1);
    repeaterTwo = new Repeater(callbackTwo, 1);

    repeaterTwo.start();
    repeaterOne.start();

    await advanceTime(1);

    repeaterOne.stop();

    await advanceTime(1);

    expect(callbackOne).toHaveBeenCalledTimes(1);
    expect(callbackTwo).toHaveBeenCalledTimes(1);
  });

  it('should resolve stopped promise', async () => {
    jest.useRealTimers();
    repeaterOne = new Repeater(callbackOne, 1);

    repeaterOne.start();

    await expect(repeaterOne.stop()).resolves.toBeUndefined();
  });

  it('should skip delay between tasks if stop() is executed', async () => {
    const { task, resolveAll } = createTaskMock();
    const sut = new Repeater(task, 10_000);

    sut.start();

    await waitForExpect(() => expect(task).toHaveBeenCalled());
    resolveAll();

    await waitForExpect(() => expect(sut.delayPromise.isPending).toBeTruthy());

    sut.stop();
    expect(sut.delayPromise.isPending).toBeFalsy();
    expect(sut.stopPromise.isPending).toBeTruthy();
    await waitForExpect(async () => {
      expect(task.mock.results[0].value).resolves.toBeUndefined();
    });
  });

  it('should continue stop process if a task takes too long to stop', async () => {
    jest.resetAllMocks();
    const { task } = createTaskMock();
    const sut = new Repeater(task, 0, { timeout: 1 });

    sut.start();
    await waitForExpect(() => expect(task).toHaveBeenCalled());
    expect(sut.delayPromise.isPending).toBeFalsy();
    expect(sut.stopPromise.isPending).toBeFalsy();

    sut.stop();
    expect(sut.delayPromise.isPending).toBeFalsy();
    expect(sut.stopPromise.isPending).toBeTruthy();
  });
});
