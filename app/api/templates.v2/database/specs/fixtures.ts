import { Property } from 'api/templates.v2/model/Property';
import { Template } from 'api/templates.v2/model/Template';
import { ObjectId } from 'mongodb';

export const createValidTemplate = () => {
  const templateId = new ObjectId().toString();

  return new Template({
    id: templateId,
    name: 'any_name',
    color: 'any_color',
    isDefault: false,
    properties: [
      new Property({
        id: new ObjectId().toString(),
        type: 'text',
        name: 'any_title',
        label: 'any_label',
        templateId: 'any_id',
        isCommonProperty: true,
      }),
      new Property({
        id: new ObjectId().toString(),
        type: 'date',
        name: 'creationDate',
        label: 'any_label',
        templateId: 'any_id',
        isCommonProperty: true,
      }),
      new Property({
        id: new ObjectId().toString(),
        type: 'date',
        name: 'editDate',
        label: 'any_label',
        templateId: 'any_id',
        isCommonProperty: true,
      }),
      new Property({
        id: new ObjectId().toString(),
        type: 'text',
        name: 'any_title',
        label: 'any_label',
        templateId: 'any_id',
        isCommonProperty: false,
      }),
    ],
  });
};
