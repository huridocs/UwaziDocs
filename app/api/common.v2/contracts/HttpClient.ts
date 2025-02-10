import { Readable } from 'stream';

type PostFormDataInput = {
  url: string;
  formData: Record<string, any>;
};

interface HttpClient {
  postFormData<T>(input: PostFormDataInput): Promise<T>;
}

type Source = Readable;

type HttpFileProps = {
  filename: string;
  source: Source;
};

class HttpFile {
  filename: string;

  source: Source;

  constructor(props: HttpFileProps) {
    this.filename = props.filename;
    this.source = props.source;
  }

  async toBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const _buf: Buffer[] = [];
      this.source.on('data', (chunk: any) => _buf.push(chunk));
      this.source.on('end', () => resolve(Buffer.concat(_buf)));
      this.source.on('error', (err: unknown) => reject(err));
    });
  }
}

export type { PostFormDataInput as PostInput, HttpClient };

export { HttpFile };
