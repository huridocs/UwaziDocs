import multer from 'multer';
import express from 'express';
import { Server } from 'http';

import { Document } from 'api/files.v2/model/Document';
import { PXExtractor } from 'api/paragraphExtraction/domain/PXExtractor';
import { Segmentation } from 'api/files.v2/model/Segmentation';
import { Template } from 'api/templates.v2/model/Template';
import { Property } from 'api/templates.v2/model/Property';
import { HttpClientFactory } from 'api/common.v2/infrastructure/HttpClientFactory';
import { PXExtractionId } from 'api/paragraphExtraction/domain/PXExtractionService';

import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { PXExternalExtractionService } from '../ExternalExtractionService';

const document = new Document('any_id', 'any_entity', 0, 'any_file_name', 'pt');
const sourceTemplate = new Template('sourceTemplate', 'Source template');
const targetTemplate = new Template('targetTemplate', 'Target template', [
  new Property('any_id', 'markdown', 'Rich name', 'Rich label', 'any_id'),
]);
const segmentation: Segmentation = {
  id: 'any_id',
  fileId: document.id,
  filename: document.filename,
  xmlname: document.filename,
  paragraphs: [
    { width: 0, height: 0, left: 0, top: 0, type: 'any_type', text: 'any_text', pageNumber: 0 },
  ],
  status: 'ready',
};
const extractor = new PXExtractor({ id: 'any_id', sourceTemplate, targetTemplate });

const upload = multer();
const app = express();
let server: Server;
let body: any;
let files: any;

app.use(express.json());
app.post('/extract_paragraphs', upload.any(), (req, res) => {
  files = req.files;
  body = req.body;
  res.status(200).send('ok');
});

describe('ExternalExtractionService', () => {
  beforeAll(async () => {
    await new Promise<void>(resolve => {
      server = app.listen(5056, resolve);
    });
  });

  afterEach(() => {
    body = undefined;
  });

  afterAll(async () => {
    await new Promise<void>(resolve => {
      server.close(err => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  });

  describe('Extract Paragraph', () => {
    it('should call http client with correct params', async () => {
      const externalExtractionService = new PXExternalExtractionService({
        httpClient: HttpClientFactory.createDefault(),
        url: 'http://localhost:5056',
      });

      await externalExtractionService.extractParagraph({
        segmentations: [segmentation],
        documents: [document],
        defaultLanguage: 'pt',
        extractionId: new PXExtractionId({
          entitySharedId: 'any_shared_id',
          extractorId: extractor.id,
        }),
        xmlFilesPath: [
          Readable.from([Buffer.from('file1')]),
          Readable.from([Buffer.from('file2')]),
          Readable.from([Buffer.from('file3')]),
        ],
      });

      expect(body).toEqual({
        json_data: JSON.stringify({
          key: 'any_id__any_shared_id',
          xmls_segments: [
            {
              language: 'pt',
              is_main_language: true,
              xml_file_name: 'any_file_name',
              xml_segments_boxes: [{ left: 0, top: 0, page_number: 0, type: 'any_type' }],
            },
          ],
        }),
      });

      expect(files).toEqual([
        {
          fieldname: 'xml_files',
          originalname: 'file',
          encoding: '7bit',
          mimetype: 'application/octet-stream',
          buffer: expect.any(Buffer),
          size: 5,
        },
        {
          fieldname: 'xml_files',
          originalname: 'file',
          encoding: '7bit',
          mimetype: 'application/octet-stream',
          buffer: expect.any(Buffer),
          size: 5,
        },
        {
          fieldname: 'xml_files',
          originalname: 'file',
          encoding: '7bit',
          mimetype: 'application/octet-stream',
          buffer: expect.any(Buffer),
          size: 5,
        },
      ]);
    });
  });
});
