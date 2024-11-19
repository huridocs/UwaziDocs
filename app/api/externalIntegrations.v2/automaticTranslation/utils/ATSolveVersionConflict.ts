import { EntityInputModel } from 'api/entities.v2/types/EntityInputDataType';

export const ATSolveVersionConflict = (
  currentEntity: EntityInputModel,
  newEntity: EntityInputModel
) => {
  return newEntity;
};
