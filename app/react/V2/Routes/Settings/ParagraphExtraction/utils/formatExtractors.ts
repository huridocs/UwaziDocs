import { Template } from 'app/apiResponseTypes';
import { ParagraphExtractorApiResponse, PXTable, PXTemplate } from '../types';
import { getTemplateProperties } from './getTemplateName';

const requiredTemplateProperties = ['_id', 'name', 'color'];

const formatExtractors = (
  extractors: ParagraphExtractorApiResponse[],
  templates: Template[]
): PXTable[] =>
  extractors.map(extractor => {
    const targetTemplate = getTemplateProperties(
      templates,
      extractor.targetTemplateId,
      requiredTemplateProperties
    ) as PXTemplate;

    const sourceTemplates = (extractor.sourceTemplateIds || []).map(sourceTemplateId =>
      getTemplateProperties(templates, sourceTemplateId, requiredTemplateProperties)
    ) as PXTemplate[];

    return {
      ...extractor,
      rowId: extractor._id || '',
      sourceTemplates,
      targetTemplate,
    };
  });

export { formatExtractors };
