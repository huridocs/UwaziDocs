import { Extractor } from './Extractor';

export interface ExtractorDataSource {
  create(extractor: Extractor): Promise<void>;
}
