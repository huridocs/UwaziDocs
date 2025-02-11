import { Template } from 'app/apiResponseTypes';
import { TemplateSchema } from 'shared/types/templateType';

const getTemplateName = (templates: Template[], targetId: string) => {
  const foundTemplate = templates.find(template => template._id === targetId);
  return foundTemplate?.name || targetId;
};

type TemplateSchemaKeys = keyof TemplateSchema;

const getTemplateProperties = (
  templates: Template[],
  targetId: string,
  properties: TemplateSchemaKeys[]
): Record<TemplateSchemaKeys, unknown> => {
  const foundTemplate = templates.find(template => template._id === targetId);
  return properties.reduce(
    (acc, property) => ({
      ...acc,
      [property]: foundTemplate?.[property],
    }),
    {} as Record<TemplateSchemaKeys, unknown>
  );
};

export { getTemplateName, getTemplateProperties };
