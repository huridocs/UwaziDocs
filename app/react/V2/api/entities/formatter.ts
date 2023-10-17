import { PropertyValueSchema } from 'shared/types/commonTypes';
import { EntitySchema } from 'shared/types/entityType';

const update = (
  entity: EntitySchema,
  data?: {
    title?: EntitySchema['title'];
    properties?: { [propertyName: string]: PropertyValueSchema | undefined }[];
  }
): EntitySchema => {
  const updatedEntity = { ...entity };

  if (!data) return entity;

  const { title, properties } = data;

  if (title) {
    updatedEntity.title = title;
  }

  if (properties?.length) {
    properties.forEach(property => {
      const [propertyName] = Object.keys(property);

      const hasProperty = updatedEntity.metadata
        ? updatedEntity.metadata[propertyName]?.length
        : false;

      if (hasProperty) {
        if (property[propertyName]) {
          updatedEntity.metadata![propertyName]![0].value = property[propertyName]!;
        }

        if (!property[propertyName]) {
          delete updatedEntity.metadata![propertyName];
        }
      }

      if (!hasProperty && property[propertyName]) {
        updatedEntity.metadata![propertyName] = [];
        updatedEntity.metadata![propertyName]?.push({ value: property[propertyName]! });
      }
    });
  }

  return updatedEntity;
};

export { update };
