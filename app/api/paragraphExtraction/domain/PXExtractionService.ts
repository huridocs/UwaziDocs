import { Segmentation } from 'api/files.v2/model/Segmentation';
import { LanguageISO6391 } from 'shared/types/commonTypes';
import { Document } from 'api/files.v2/model/Document';
import { Readable } from 'stream';

type ExtractParagraphInput = {
  segmentations: Segmentation[];
  documents: Document[];
  defaultLanguage: LanguageISO6391;
  extractionId: PXExtractionId;
  xmlFilesPath: Readable[];
};

interface PXExtractionService {
  extractParagraph(extraction: ExtractParagraphInput): Promise<void>;
}

type ExtractionIdProps = {
  extractorId: string;
  entitySharedId: string;
};

class PXExtractionId {
  id: string;

  constructor(props: ExtractionIdProps) {
    this.id = `${props.extractorId}__${props.entitySharedId}`;
  }
}

export type { ExtractParagraphInput, PXExtractionService };

export { PXExtractionId };
