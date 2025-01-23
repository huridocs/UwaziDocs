import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Storage, S3TimeoutError } from '../S3Storage';

let s3Storage: S3Storage;

class S3TimeoutClient {
  // eslint-disable-next-line class-methods-use-this
  send() {
    const error = new Error();
    error.name = 'TimeoutError';
    throw error;
  }
}

class MockS3Client {
  uploadedFiles: { key: string; body: Buffer }[] = [];
  deletedFiles: string[] = [];
  shouldFailOnKey?: string;

  async send(command: any) {
    if (command instanceof PutObjectCommand) {
      if (command.input.Key === this.shouldFailOnKey) {
        throw new Error(`Failed to upload ${command.input.Key}`);
      }
      this.uploadedFiles.push({ 
        key: command.input.Key, 
        body: command.input.Body 
      });
      return {};
    }
    if (command instanceof DeleteObjectCommand) {
      this.deletedFiles.push(command.input.Key);
      return {};
    }
    return {};
  }
}

describe('s3Storage', () => {
  beforeAll(async () => {
    // @ts-ignore
    s3Storage = new S3Storage(new S3TimeoutClient());
  });

  describe('get', () => {
    it('should throw S3TimeoutError on timeout', async () => {
      await expect(s3Storage.get('dummy_key')).rejects.toBeInstanceOf(S3TimeoutError);
    });
  });

  describe('upload', () => {
    it('should throw S3TimeoutError on timeout', async () => {
      await expect(
        s3Storage.upload('dummy_key', Buffer.from('dummy buffer', 'utf-8'))
      ).rejects.toBeInstanceOf(S3TimeoutError);
    });
  });

  describe('delete', () => {
    it('should throw S3TimeoutError on timeout', async () => {
      await expect(s3Storage.delete('dummy_key')).rejects.toBeInstanceOf(S3TimeoutError);
    });
  });

  describe('list', () => {
    it('should throw S3TimeoutError on timeout', async () => {
      await expect(s3Storage.list()).rejects.toBeInstanceOf(S3TimeoutError);
    });
  });

  describe('uploadMany', () => {
    let mockS3Client: MockS3Client;

    beforeEach(() => {
      mockS3Client = new MockS3Client();
      // @ts-ignore
      s3Storage = new S3Storage(mockS3Client);
    });

    it('should upload multiple files successfully', async () => {
      const files = [
        { key: 'file1.txt', body: Buffer.from('content1') },
        { key: 'file2.txt', body: Buffer.from('content2') },
      ];

      await s3Storage.uploadMany(files);

      expect(mockS3Client.uploadedFiles).toHaveLength(2);
      expect(mockS3Client.uploadedFiles[0]).toEqual(files[0]);
      expect(mockS3Client.uploadedFiles[1]).toEqual(files[1]);
      expect(mockS3Client.deletedFiles).toHaveLength(0);
    });

    it('should cleanup uploaded files if one upload fails', async () => {
      mockS3Client.shouldFailOnKey = 'file2.txt';
      const files = [
        { key: 'file1.txt', body: Buffer.from('content1') },
        { key: 'file2.txt', body: Buffer.from('content2') },
      ];

      await expect(s3Storage.uploadMany(files)).rejects.toThrow('Failed to upload file2.txt');

      expect(mockS3Client.uploadedFiles).toHaveLength(1);
      expect(mockS3Client.uploadedFiles[0]).toEqual(files[0]);
      expect(mockS3Client.deletedFiles).toHaveLength(1);
      expect(mockS3Client.deletedFiles[0]).toBe('file1.txt');
    });

    it('should throw S3TimeoutError on timeout', async () => {
      // @ts-ignore
      s3Storage = new S3Storage(new S3TimeoutClient());
      
      await expect(
        s3Storage.uploadMany([
          { key: 'file1.txt', body: Buffer.from('content1') }
        ])
      ).rejects.toBeInstanceOf(S3TimeoutError);
    });
  });
});
