import { Segmentation } from 'api/files.v2/model/Segmentation';
import { PXExtractionService } from '../domain/PXExtractionService';

type SegmentBoxDTO = {
  left: number;
  top: number;
  width: number;
  height: number;
  page_number: number;
  type: string;
};

type SegmentDTO = {
  xml_file_name: string;
  language: string;
  is_main_language: boolean;
  xml_segments_boxes: SegmentBoxDTO[];
};

type ExtractionDTO = {
  key: string;
  xmls_segments: SegmentDTO[];
};

type Dependencies = {
  httpClient: typeof fetch;
};

export class PXExternalExtractionService implements PXExtractionService {
  private BASE_URL = 'extract_paragraphs';

  constructor(private dependencies: Dependencies) {}

  extractParagraph(segmentations: Segmentation[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
