import { EventEmitter } from 'api/common.v2/domain/event/event-emitter';

export const createEventEmitterMockAdapter = (): EventEmitter => ({
  emit: jest.fn(),
  listen: jest.fn(),
});
