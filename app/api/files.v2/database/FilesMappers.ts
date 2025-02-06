import { LanguageUtils } from 'shared/language';
import { LanguageISO6391 } from 'shared/types/commonTypes';
import { FileDBOType } from './schemas/filesTypes';
import { UwaziFile } from '../model/UwaziFile';
import { Document } from '../model/Document';
import { URLAttachment } from '../model/URLAttachment';
import { Attachment } from '../model/Attachment';
import { CustomUpload } from '../model/CustomUpload';

export const FileMappers = {
  toModel(fileDBO: FileDBOType): UwaziFile {
    if (fileDBO.type === 'attachment' && fileDBO.url) {
      return new URLAttachment(
        fileDBO._id.toString(),
        fileDBO.entity,
        fileDBO.totalPages,
        fileDBO.url
      ).withCreationDate(new Date(fileDBO.creationDate));
    }
    if (fileDBO.type === 'attachment') {
      return new Attachment(
        fileDBO._id.toString(),
        fileDBO.entity,
        fileDBO.totalPages,
        fileDBO.filename
      ).withCreationDate(new Date(fileDBO.creationDate));
    }

    if (fileDBO.type === 'custom') {
      return new CustomUpload(
        fileDBO._id.toString(),
        fileDBO.entity,
        fileDBO.totalPages,
        fileDBO.filename
      ).withCreationDate(new Date(fileDBO.creationDate));
    }
    return this.toDocumentModel(fileDBO);
  },

  toDocumentModel(fileDBO: FileDBOType) {
    return new Document(
      fileDBO._id.toString(),
      fileDBO.entity,
      fileDBO.totalPages,
      fileDBO.filename,
      LanguageUtils.fromISO639_3(fileDBO.language).ISO639_1 as LanguageISO6391
    ).withCreationDate(new Date(fileDBO.creationDate));
  },
};
