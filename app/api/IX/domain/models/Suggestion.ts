import { ObjectIdSchema, PropertyValueSchema } from 'shared/types/commonTypes';

export interface SuggestionData {
  language: string;
  fileId: ObjectIdSchema;
  entityId: string;
  entityTemplate: string;
  extractorId: ObjectIdSchema;
  propertyName: string;
  status: 'processing' | 'failed' | 'ready';
  error: string;
  segment: string;
  suggestedValue: PropertyValueSchema | PropertyValueSchema[];
  date: number;
}

export class Suggestion {
  private constructor(private data: SuggestionData) {}

  static createBlank(params: {
    language: string;
    fileId: ObjectIdSchema;
    entityId: string;
    entityTemplate: string;
    extractorId: ObjectIdSchema;
    propertyName: string;
    suggestedValue: PropertyValueSchema | PropertyValueSchema[];
  }): Suggestion {
    return new Suggestion({
      ...params,
      status: 'ready',
      error: '',
      segment: '',
      date: new Date().getTime(),
    });
  }

  get value(): SuggestionData {
    return { ...this.data };
  }
} 