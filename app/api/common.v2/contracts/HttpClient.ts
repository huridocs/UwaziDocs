type PostFormDataInput = {
  url: string;
  formData: Record<string, any>;
};

interface HttpClient {
  postFormData<T>(input: PostFormDataInput): Promise<T>;
}

export type { PostFormDataInput, HttpClient };
