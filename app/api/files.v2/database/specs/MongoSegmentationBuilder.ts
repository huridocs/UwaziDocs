import { ObjectId } from 'mongodb';
import { SegmentationType } from 'shared/types/segmentationType';

type Props = SegmentationType;

export class MongoSegmentationBuilder {
  private constructor(private props: Props) {}

  static create() {
    return new MongoSegmentationBuilder({
      _id: new ObjectId(),
    });
  }

  withId(id: ObjectId) {
    this.props._id = id;

    return this;
  }

  withFileId(id: ObjectId) {
    this.props.fileID = id;

    return this;
  }

  build(): SegmentationType {
    return { ...this.props };
  }
}
