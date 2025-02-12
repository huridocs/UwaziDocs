import { S3Storage, S3Error } from '../S3Storage';

class MockS3Error extends Error {
  $metadata = {
    requestId: 'mock-request-123',
    cfId: 'mock-cf-456',
    httpStatusCode: 500,
    attempts: 3,
    totalRetryDelay: 1000,
  };

  constructor() {
    super('Mock S3 Error');
    this.name = 'S3ServiceError';
  }
}

class MockS3Client {
  send() {
    throw new MockS3Error();
  }
}

describe('s3Storage error handling', () => {
  let s3Storage: S3Storage;

  beforeEach(() => {
    s3Storage = new S3Storage(new MockS3Client());
  });

  const expectedMetadata = {
    requestId: 'mock-request-123',
    cfId: 'mock-cf-456',
    httpStatusCode: 500,
    attempts: 3,
    totalRetryDelay: 1000,
  };

  describe('error wrapping', () => {
    it('should wrap S3 errors with metadata for get operation', async () => {
      try {
        await s3Storage.get('some_key');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(S3Error);
        expect(error.originalError.$metadata).toEqual(expectedMetadata);
        expect(error.httpStatusCode).toBe(500);
      }
    });

    it('should wrap S3 errors with metadata for upload operation', async () => {
      try {
        await s3Storage.upload('some_key', Buffer.from('test'));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(S3Error);
        expect(error.originalError.$metadata).toEqual(expectedMetadata);
        expect(error.httpStatusCode).toBe(500);
      }
    });

    it('should wrap S3 errors with metadata for delete operation', async () => {
      try {
        await s3Storage.delete('some_key');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(S3Error);
        expect(error.originalError.$metadata).toEqual(expectedMetadata);
        expect(error.httpStatusCode).toBe(500);
      }
    });

    it('should wrap S3 errors with metadata for list operation', async () => {
      try {
        await s3Storage.list('some_prefix');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(S3Error);
        expect(error.originalError.$metadata).toEqual(expectedMetadata);
        expect(error.httpStatusCode).toBe(500);
      }
    });
  });
});
