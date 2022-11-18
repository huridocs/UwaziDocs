import { MongoClient, ClientSession } from 'mongodb';
import { TransactionManager } from '../contracts/TransactionManager';

export class MongoTransactionManager implements TransactionManager {
  private mongoClient: MongoClient;

  private session?: ClientSession;

  private onCommitHandlers: ((returnValue: any) => Promise<void>)[];

  private finished = false;

  constructor(mongoClient: MongoClient) {
    this.onCommitHandlers = [];
    this.mongoClient = mongoClient;
  }

  async executeOnCommitHandlers(returnValue: unknown) {
    return Promise.all(this.onCommitHandlers.map(async handler => handler(returnValue)));
  }

  private validateState() {
    if (this.session) {
      if (this.finished) {
        throw new Error('Transaction already finished.');
      }

      throw new Error('Transaction already in progress.');
    }
  }

  private async commitWithRetry() {
    try {
      await this.session!.commitTransaction();
      this.finished = true;
    } catch (error) {
      if (error.hasErrorLabel && error.hasErrorLabel('UnknownTransactionCommitResult')) {
        await this.commitWithRetry();
      } else {
        throw error;
      }
    }
  }

  private startTransaction() {
    this.session!.startTransaction();
  }

  private async abortTransaction() {
    await this.session!.abortTransaction();
  }

  private async runInTransaction<T>(callback: () => Promise<T>) {
    this.startTransaction();
    try {
      const returnValue = await callback();
      await this.commitWithRetry();
      return returnValue;
    } catch (error) {
      await this.abortTransaction();
      throw error;
    }
  }

  private async runWithRetry<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await this.runInTransaction(callback);
    } catch (error) {
      if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) {
        return this.runWithRetry(callback);
      }

      throw error;
    }
  }

  async run<T>(callback: () => Promise<T>) {
    this.validateState();

    this.session = this.mongoClient.startSession();

    try {
      const returnValue = await this.runWithRetry(callback);
      await this.executeOnCommitHandlers(returnValue);
      return returnValue;
    } finally {
      await this.session.endSession();
    }
  }

  runHandlingOnCommitted<T>(callback: () => Promise<T>) {
    return {
      onCommitted: async (handler: (returnValue: T) => Promise<void>) => {
        this.onCommitHandlers.push(handler);
        return this.run(callback);
      },
    };
  }

  getSession() {
    return this.session;
  }

  onCommitted(handler: () => Promise<void>) {
    this.onCommitHandlers.push(handler);
    return this;
  }
}
