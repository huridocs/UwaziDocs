import superagent from 'superagent';
import { File } from 'api/files.v2/model/File';
import { HttpClient, PostFormDataInput } from '../contracts/HttpClient';

export class SuperAgentHttpClient implements HttpClient {
  private client = superagent;

  async postFormData<T>({ url, formData }: PostFormDataInput): Promise<T> {
    const request = this.client.post(url);

    await this.appendFormDataToRequest(request, formData);

    const response = await request;

    return response.body as T;
  }

  private async appendFormDataToRequest(
    request: superagent.Request,
    formData: Record<string, any>
  ) {
    const appendPromises = Object.entries(formData).map(async ([key, value]) =>
      this.appendFormData(request, key, value)
    );
    await Promise.all(appendPromises);
  }

  private async appendFormData(request: superagent.Request, key: string, value: any) {
    if (value instanceof File) {
      await this.attachFile(request, key, value);
    } else if (Array.isArray(value)) {
      await this.appendArray(request, key, value);
    } else if (typeof value === 'object' && value !== null) {
      this.appendObject(request, key, value);
    } else {
      this.appendPrimitive(request, key, value);
    }
  }

  private async attachFile(request: superagent.Request, key: string, file: File) {
    const fileBuffer = await file.toBuffer();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    request.attach(key, fileBuffer, file.filename);
  }

  private async appendArray(request: superagent.Request, key: string, array: any[]) {
    const appendPromises = array.map(async item => this.appendFormData(request, key, item));
    await Promise.all(appendPromises);
  }

  private appendObject(request: superagent.Request, key: string, object: object) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    request.field(key, JSON.stringify(object));
  }

  private appendPrimitive(request: superagent.Request, key: string, value: any) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    request.field(key, value);
  }
}
