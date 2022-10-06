import testingDB from 'api/utils/testing_db';
import { MongoDataSource } from '../MongoDataSource';

class DummyDataSource extends MongoDataSource {
  protected collectionName = 'dummy';
}

describe('when trying to set the transaction context in MongoDataSource', () => {
  it('should not throw an error when overwriting the context', () => {
    const dataSource = new DummyDataSource(testingDB.mongodb!);
    // @ts-ignore
    dataSource.setTransactionContext({});
    // @ts-ignore
    expect(() => dataSource.setTransactionContext({})).not.toThrow();
  });
});
