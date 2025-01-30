import { PXExtractor } from './PXExtractor';

export interface PXExtractorsDataSource {
  create(extractor: PXExtractor): Promise<void>;
}
