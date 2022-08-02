import EventEmitter from 'events';
import path from 'path';
import { detectLanguage } from 'shared/detectLanguage';
import { spawn } from 'child-process-promise';
import { errorLog } from 'api/log';
import { createError } from 'api/utils';

class PDF extends EventEmitter {
  constructor(file) {
    super();
    this.file = file;
    this.filepath = path.join(file.destination || '', file.filename || '');
  }

  getThumbnailPath(documentId) {
    return path.join(path.dirname(this.filepath), documentId);
  }

  async extractText() {
    try {
      const result = await spawn('pdftotext', [this.filepath, '-'], {
        capture: ['stdout', 'stderr'],
      });
      const pages = result.stdout.split('\f').slice(0, -1);
      return {
        fullText: pages.reduce(
          (memo, page, index) => ({
            ...memo,
            [index + 1]: page.replace(/(\S+)(\s?)/g, `$1[[${index + 1}]]$2`),
          }),
          {}
        ),
        fullTextWithoutPages: pages.reduce(
          (memo, page, index) => ({
            ...memo,
            [index + 1]: page,
          }),
          {}
        ),
        totalPages: pages.length,
      };
    } catch (e) {
      if (e.name === 'ChildProcessError') {
        throw createError(`${e.message}\nstderr output:\n${e.stderr}`);
      }
      throw createError(e.message);
    }
  }

  async createThumbnail(documentId) {
    const thumbnailPath = this.getThumbnailPath(documentId);
    let response;
    try {
      await spawn(
        'pdftoppm',
        ['-f', '1', '-singlefile', '-scale-to', '320', '-jpeg', this.filepath, thumbnailPath],
        { capture: ['stdout', 'stderr'] }
      );
      response = `${documentId}.jpg`;
    } catch (err) {
      response = err;
      errorLog.error(`Thumbnail creation error for: ${this.filepath}`);
    }

    return Promise.resolve(response);
  }

  generateFileInfo(conversion) {
    return {
      ...this.file,
      language: detectLanguage(Object.values(conversion.fullTextWithoutPages).join(''), 'franc'),
    };
  }

  async convert() {
    return this.extractText().then(conversion => ({
      ...conversion,
      ...this.generateFileInfo(conversion),
      processed: true,
      toc: [],
    }));
  }
}

export { PDF };
