import { Db } from 'mongodb';
import { MongoDataSource } from 'api/common.v2/database/MongoDataSource';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { Suggestion, SuggestionData } from '../../domain/models/Suggestion';

export class SuggestionRepository extends MongoDataSource<SuggestionData> {
  protected collectionName = 'ixsuggestions';

  constructor(db: Db, transactionManager: MongoTransactionManager) {
    super(db, transactionManager);
  }

  async saveMultiple(suggestions: Suggestion[]): Promise<void> {
    const collection = this.getCollection();
    if (suggestions.length) {
      await collection.insertMany(suggestions.map(s => s.value));
    }
  }
}
