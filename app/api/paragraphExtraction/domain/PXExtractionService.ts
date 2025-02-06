import { Segmentation } from 'api/files.v2/model/Segmentation';

export interface PXExtractionService {
  extractParagraph(segmentations: Segmentation[]): Promise<void>;
}
