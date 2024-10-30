import { Logger } from '../contracts/Logger';

export const createMockLogger = (): Logger => ({
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  critical: jest.fn(),
  warning: jest.fn(),
});

export const mockConsole = () => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.error = jest.fn();
};

export const restoreMockConsole = () => {
  (console.log as jest.Mock).mockRestore();
  (console.info as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
};
