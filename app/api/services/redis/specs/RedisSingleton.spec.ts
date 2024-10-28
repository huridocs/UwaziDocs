import { RedisSingleton } from '../RedisSingleton';

describe('RedisSingleton', () => {
  test('Should create only one instance', () => {
    const getInstanceSpy = jest.spyOn(RedisSingleton, 'getInstance');
    const constructorSpy = jest.spyOn(RedisSingleton as any, 'constructor');

    expect(RedisSingleton.getInstance().getClient()).toBe(RedisSingleton.getInstance().getClient());

    expect(getInstanceSpy).toHaveBeenCalledTimes(2);
    expect(constructorSpy).toHaveBeenCalledTimes(0);

    getInstanceSpy.mockRestore();
    RedisSingleton.getInstance().disconnect();
  });
});
