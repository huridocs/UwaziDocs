import { ObjectId } from 'mongodb';

export type MongoExtractor = {
  _id: ObjectId;
  targetTemplateId: ObjectId;
  sourceTemplateId: ObjectId;
};
