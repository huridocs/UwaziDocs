import path from 'path';
import urljoin from 'url-join';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { fileExists, readFile, uploadsPath } from 'api/files';
import { ResultsMessage, TaskManager } from 'api/services/tasksmanager/TaskManager';
import { IXSuggestionsModel } from 'api/suggestions/IXSuggestionsModel';
import { SegmentationModel } from 'api/services/pdfsegmentation/segmentationModel';
import { PDFSegmentation } from 'api/services//pdfsegmentation/PDFSegmentation';
import { EnforcedWithId } from 'api/odm';
import { tenants } from 'api/tenants/tenantContext';
import { emitToTenant } from 'api/socketio/setupSockets';
import { filesModel } from 'api/files/filesModel';
import entities from 'api/entities/entities';
import settings from 'api/settings/settings';
import templatesModel from 'api/templates/templates';
import request from 'shared/JSONRequest';
import languages from 'shared/languages';
import { EntitySchema } from 'shared/types/entityType';
import { ObjectIdSchema, PropertySchema } from 'shared/types/commonTypes';
import { TemplateSchema } from 'shared/types/templateType';
import { IXSuggestionType } from 'shared/types/suggestionType';
import { FileType } from 'shared/types/fileType';
import { IXModelsModel } from './IXModelsModel';
import {
  FileWithAggregation,
  getFilesForTraining,
  getFilesForSuggestions,
} from 'api/services/informationextraction/getFiles';

type RawSuggestion = {
  tenant: string;
  /* eslint-disable camelcase */
  property_name: string;
  xml_file_name: string;
  text: string;
  segment_text: string;
  page_number: number;
  /* eslint-enable camelcase */
};

class InformationExtraction {
  static SERVICE_NAME = 'information_extraction';

  public taskManager: TaskManager;

  static mock: any;

  constructor() {
    this.taskManager = new TaskManager({
      serviceName: InformationExtraction.SERVICE_NAME,
      processResults: this.processResults,
    });
  }

  requestResults = async (message: ResultsMessage) => {
    const response = await request.get(message.data_url);

    return JSON.parse(response.json);
  };

  static sendXmlToService = async (
    serviceUrl: string,
    xmlName: string,
    property: string,
    type: string
  ) => {
    const fileContent = await readFile(
      uploadsPath(path.join(PDFSegmentation.SERVICE_NAME, xmlName))
    );
    const endpoint = type === 'labeled_data' ? 'xml_to_train' : 'xml_to_predict';
    const url = urljoin(serviceUrl, endpoint, tenants.current().name, property);
    return request.uploadFile(url, xmlName, fileContent);
  };

  sendMaterials = async (
    files: FileWithAggregation[],
    property: string,
    serviceUrl: string,
    type = 'labeled_data'
  ) => {
    await Promise.all(
      files.map(async file => {
        const xmlName = file.segmentation.xmlname!;
        const xmlExists = await fileExists(
          uploadsPath(path.join(PDFSegmentation.SERVICE_NAME, xmlName))
        );

        const propertyLabeledData = file.extractedMetadata?.find(
          labeledData => labeledData.name === property
        );

        if (!xmlExists || (type === 'labeled_data' && !propertyLabeledData)) {
          return;
        }

        await InformationExtraction.sendXmlToService(serviceUrl, xmlName, property, type);

        let data: any = {
          xml_file_name: xmlName,
          property_name: property,
          tenant: tenants.current().name,
          xml_segments_boxes: file.segmentation.segmentation?.paragraphs,
          page_width: file.segmentation.segmentation?.page_width,
          page_height: file.segmentation.segmentation?.page_height,
        };

        if (type === 'labeled_data' && propertyLabeledData) {
          const defaultTrainingLanguage = 'en';
          data = {
            ...data,
            language_iso: languages.get(file.language!, 'ISO639_1') || defaultTrainingLanguage,
            label_text: propertyLabeledData.selection?.text,
            label_segments_boxes: propertyLabeledData.selection?.selectionRectangles?.map(r => {
              const { page, ...selection } = r;
              return { ...selection, page_number: page };
            }),
          };
        }
        await request.post(urljoin(serviceUrl, type), data);
        if (type === 'prediction_data') {
          await this.saveSuggestionProcess(file, property);
        }
      })
    );
  };

  _getEntityFromFile = async (file: EnforcedWithId<FileType> | FileWithAggregation) => {
    let [entity] = await entities.getUnrestricted({
      sharedId: file.entity,
      language: languages.get(file.language!, 'ISO639_1'),
    });

    if (!entity) {
      const defaultLanguage = await settings.getDefaultLanguage();
      [entity] = await entities.getUnrestricted({
        sharedId: file.entity,
        language: defaultLanguage?.key,
      });
    }
    return entity;
  };

  _getEntityFromSuggestion = async (rawSuggestion: RawSuggestion): Promise<null | EntitySchema> => {
    const [segmentation] = await SegmentationModel.get({
      xmlname: rawSuggestion.xml_file_name,
    });

    if (!segmentation) {
      return null;
    }
    const [file] = await filesModel.get({ _id: segmentation.fileID });

    if (!file) {
      return null;
    }

    return this._getEntityFromFile(file);
  };

  coerceSuggestionValue = (suggestion: RawSuggestion, templates: TemplateSchema[]) => {
    const allProps: PropertySchema[] = _.flatMap(templates, template => template.properties || []);

    const property = allProps.find(p => p.name === suggestion.property_name);

    let suggestedValue: any = suggestion.text.trim();

    if (property?.type === 'date') {
      suggestedValue = new Date(suggestion.text).getTime();
    }

    if (Number.isNaN(suggestedValue)) {
      return null;
    }

    return suggestedValue;
  };

  saveSuggestions = async (message: ResultsMessage) => {
    const templates = await templatesModel.get();
    const rawSuggestions: RawSuggestion[] = await this.requestResults(message);

    return Promise.all(
      rawSuggestions.map(async rawSuggestion => {
        const entity = await this._getEntityFromSuggestion(rawSuggestion);
        if (!entity) {
          return Promise.resolve();
        }
        const [currentSuggestion] = await IXSuggestionsModel.get({
          entityId: entity.sharedId,
          propertyName: rawSuggestion.property_name,
        });

        let status: 'ready' | 'failed' = 'ready';
        let error = '';

        const suggestedValue = this.coerceSuggestionValue(rawSuggestion, templates);
        if (suggestedValue === null) {
          status = 'failed';
          error = 'Invalid value for property type';
        }

        if (!message.success) {
          status = 'failed';
          error = message.error_message ? message.error_message : 'Unknown error';
        }

        const suggestion: IXSuggestionType = {
          ...currentSuggestion,
          entityId: entity.sharedId!,
          language: entity.language!,
          propertyName: rawSuggestion.property_name,
          suggestedValue,
          segment: rawSuggestion.segment_text,
          status,
          error,
          date: new Date().getTime(),
          page: rawSuggestion.page_number,
        };
        return IXSuggestionsModel.save(suggestion);
      })
    );
  };

  saveSuggestionProcess = async (file: FileWithAggregation, propertyName: string) => {
    const entity = await this._getEntityFromFile(file);

    const [existingSuggestions] = await IXSuggestionsModel.get({
      entityId: entity.sharedId,
      propertyName,
      language: entity.language,
    });
    const suggestion: IXSuggestionType = {
      ...existingSuggestions,
      entityId: entity.sharedId!,
      language: entity.language!,
      propertyName,
      status: 'processing',
      date: new Date().getTime(),
    };

    return IXSuggestionsModel.save(suggestion);
  };

  serviceUrl = async () => {
    const settingsValues = await settings.get();
    const serviceUrl = settingsValues.features?.metadataExtraction?.url;
    if (!serviceUrl) {
      throw new Error('No url for metadata extraction service');
    }

    return serviceUrl;
  };

  getSuggestions = async (property: string) => {
    const files = await this.getFilesForSuggestions(property);
    if (files.length === 0) {
      emitToTenant(tenants.current().name, 'ix_model_status', property, 'ready', 'Completed');
      return;
    }

    await this.materialsForSuggestions(files, property);
    await this.taskManager.startTask({
      task: 'suggestions',
      tenant: tenants.current().name,
      params: { property_name: property },
    });
  };

  getFilesForSuggestions = async (property: string) => {
    const templates = await this.getTemplatesWithProperty(property);
    return getFilesForSuggestions(templates, property);
  };

  materialsForSuggestions = async (files: FileWithAggregation[], property: string) => {
    const serviceUrl = await this.serviceUrl();

    await this.sendMaterials(files, property, serviceUrl, 'prediction_data');
  };

  trainModel = async (property: string) => {
    const templates: ObjectIdSchema[] = await this.getTemplatesWithProperty(property);
    const serviceUrl = await this.serviceUrl();
    const materialsSent = await this.materialsForModel(templates, property, serviceUrl);
    if (!materialsSent) {
      return { status: 'error', message: 'No labeled data' };
    }

    await this.taskManager.startTask({
      task: 'create_model',
      tenant: tenants.current().name,
      params: { property_name: property },
    });

    await this.saveModelProcess(property);
    return { status: 'processing_model', message: 'Training model' };
  };

  status = async (property: string) => {
    const [currentModel] = await IXModelsModel.get({
      propertyName: property,
      status: 'processing',
    });

    if (currentModel) {
      return { status: 'processing_model', message: 'Training model' };
    }

    const [suggestion] = await IXSuggestionsModel.get({
      propertyName: property,
      status: 'processing',
    });

    if (suggestion) {
      return { status: 'processing_suggestions', message: 'Getting suggestions' };
    }

    return { status: 'ready', message: 'Ready' };
  };

  materialsForModel = async (templates: ObjectIdSchema[], property: string, serviceUrl: string) => {
    const files = await getFilesForTraining(templates, property);
    if (!files.length) {
      return false;
    }
    await this.sendMaterials(files, property, serviceUrl);
    return true;
  };

  saveModelProcess = async (property: string) => {
    const [currentModel] = await IXModelsModel.get({
      propertyName: property,
    });

    await IXModelsModel.save({
      ...currentModel,
      status: 'processing',
      creationDate: new Date().getTime(),
      propertyName: property,
    });
  };

  getTemplatesWithProperty = async (property: string) => {
    const settingsValues = await settings.get();
    const metadataExtractionSettings = settingsValues.features?.metadataExtraction?.templates || [];
    return metadataExtractionSettings
      .filter(t => t.properties.includes(property) && t.template)
      .map(t => new ObjectId(t.template));
  };

  processResults = async (message: ResultsMessage): Promise<void> => {
    await tenants.run(async () => {
      if (message.task === 'create_model' && message.success) {
        const [currentModel] = await IXModelsModel.get({
          propertyName: message.params!.property_name,
        });

        await IXModelsModel.save({
          ...currentModel,
          status: 'ready',
          creationDate: new Date().getTime(),
        });

        emitToTenant(
          message.tenant,
          'ix_model_status',
          message.params!.property_name,
          'processing_suggestions',
          'Getting suggestions'
        );

        await this.getSuggestions(message.params!.property_name);
      }

      if (message.task === 'suggestions') {
        await this.saveSuggestions(message);
        await this.getSuggestions(message.params!.property_name);
      }
    }, message.tenant);
  };
}

export { InformationExtraction };
