import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'api/config';
import { tenants } from 'api/tenants';
import { errorLog } from 'api/log';
// eslint-disable-next-line node/no-restricted-import
import { createReadStream, createWriteStream } from 'fs';
import { FileType } from 'shared/types/fileType';
import { access, readFile } from 'fs/promises';
import { Readable } from 'stream';
import { attachmentsPath, customUploadsPath, deleteFile, uploadsPath } from './filesystem';

type FileTypes = NonNullable<FileType['type']>;

let s3ClientInstance: S3Client;
const s3instance = () => {
  if (config.s3.endpoint && !s3ClientInstance) {
    s3ClientInstance = new S3Client({
      apiVersion: 'latest',
      region: 'uwazi-development',
      endpoint: config.s3.endpoint,
      credentials: config.s3.credentials,
      forcePathStyle: true, // needed for minio
    });
  }
  return s3ClientInstance;
};

const paths: { [k in FileTypes]: (filename: string) => string } = {
  custom: customUploadsPath,
  document: uploadsPath,
  thumbnail: uploadsPath,
  attachment: attachmentsPath,
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const _buf: Buffer[] = [];
    stream.on('data', (chunk: any) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err: unknown) => reject(err));
  });

const s3KeyWithPath = (filename: string, type: FileTypes) =>
  paths[type](filename).split('/').slice(-2).join('/');

const readFromS3 = async (filename: string, type: FileTypes): Promise<Readable> => {
  const s3 = s3instance();
  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: tenants.current().name.replace('_', '-'),
        Key: s3KeyWithPath(filename, type),
      })
    );
    return response.Body as Readable;
  } catch (e: unknown) {
    if (e instanceof NoSuchKey) {
      const start = Date.now();
      s3.send(
        new PutObjectCommand({
          Bucket: tenants.current().name.replace('_', '-'),
          Key: s3KeyWithPath(filename, type),
          Body: await readFile(paths[type](filename)),
        })
      )
        .then(() => {
          const finish = Date.now();
          errorLog.debug(
            `File "${filename}" uploaded to S3 in ${(finish - start) / 1000} for tenant ${
              tenants.current().name
            }`
          );
        })
        .catch(error => {
          errorLog.error(
            `File "${filename}" Failed to be uploaded to S3 with error: ${
              error.message
            } for tenant ${tenants.current().name}`
          );
        });

      return createReadStream(paths[type](filename));
    }
    throw e;
  }
};

export const readableFile = async (filename: string, type: FileTypes) => {
  if (tenants.current().featureFlags?.s3Storage) {
    return readFromS3(filename, type);
  }
  return createReadStream(paths[type](filename));
};

export const fileContents = async (filename: string, type: FileTypes) =>
  streamToBuffer(await readableFile(filename, type));

export const removeFile = async (filename: string, type: FileTypes) =>
  deleteFile(paths[type](filename));

export const removeFiles = async (files: FileType[]) =>
  Promise.all(files.map(async file => removeFile(file.filename || '', file.type || 'document')));

export const storeFile = async (filename: string, file: Readable, type: FileTypes) => {
  file.pipe(createWriteStream(paths[type](filename)));
  return new Promise(resolve => file.on('close', resolve));
};

export const fileExists = async (filename: string, type: FileTypes): Promise<boolean> => {
  try {
    await access(paths[type](filename));
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return false;
    }
    if (err) {
      throw err;
    }
  }
  return true;
};
