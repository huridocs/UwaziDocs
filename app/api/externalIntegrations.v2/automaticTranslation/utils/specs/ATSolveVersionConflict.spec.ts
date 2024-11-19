import { entityInputDataSchema } from 'api/entities.v2/types/EntityInputDataSchema';
import { EntityInputModel } from 'api/entities.v2/types/EntityInputDataType';
import { getFixturesFactory } from 'api/utils/fixturesFactory';
import { EntitySchema } from 'shared/types/entityType';
import { inspect } from 'util';
import { Validator } from '../../infrastructure/Validator';
import { ATSolveVersionConflict } from '../ATSolveVersionConflict';

const factory = getFixturesFactory();

const inputModelValidator = new Validator<EntityInputModel>(entityInputDataSchema);

function toInputModel(entity: EntitySchema): EntityInputModel {
  // eslint-disable-next-line no-param-reassign
  entity._id = entity._id?.toString();
  // eslint-disable-next-line no-param-reassign
  entity.template = entity.template?.toString();
  if (inputModelValidator.validate(entity)) {
    return entity;
  }
  throw inspect(inputModelValidator.getErrors());
}

describe('ATSolveVersionConflict', () => {
  describe('when current entity to translate properties are the same', () => {
    it('should return newEntity', async () => {
      const currentEntity = factory.entity('current entity', 'template');
      const newEntity = factory.entity('new entity', 'template');
      expect(ATSolveVersionConflict(toInputModel(currentEntity), toInputModel(newEntity))).toBe(
        newEntity
      );
    });
  });

  describe('when current entity has translated properties but newEntity comes with "pending translation"', () => {
    it('should replace the pending ones for the already translated property', async () => {
      const currentEntity = factory.entity('current entity', 'template');
      const newEntity = factory.entity('new entity', 'template');
      expect(ATSolveVersionConflict(toInputModel(currentEntity), toInputModel(newEntity))).toBe(
        newEntity
      );
    });
  });
});
