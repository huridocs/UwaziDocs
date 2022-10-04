import testingDB from 'api/utils/testing_db';
import { TransactionContextAlreadySetError } from '../errors/TransactionContextAlreadySetError';
import { MongoDataSource } from '../MongoDataSource';

class DummyDataSource extends MongoDataSource {
  protected collectionName = 'dummy';
}

describe('when trying to set the transaction context in MongoDataSource', () => {
  it('should throw an error if it already has a context', () => {
    const dataSource = new DummyDataSource(testingDB.mongodb!);
    // @ts-ignore
    dataSource.setTransactionContext({});
    // @ts-ignore
    expect(() => dataSource.setTransactionContext({})).toThrow(TransactionContextAlreadySetError);
  });
});
