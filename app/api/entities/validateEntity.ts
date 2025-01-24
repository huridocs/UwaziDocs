import { validateEntitySchema } from './validation/validateEntitySchema';
import { validateEntityData } from './validation/validateEntityData';
import templates from 'api/templates';

export const validateEntity = async (entity: any) => {
  await validateEntitySchema(entity);
  await validateEntityData(entity);
};
