import { CommonProperty } from '../CommonProperty';

const titleCommonProperty = new CommonProperty(
  'any_id',
  'text',
  'any_title',
  'any_label',
  'any_id'
);

const creationDateCommonProperty = new CommonProperty(
  'any_id',
  'date',
  'creationDate',
  'any_label',
  'any_id'
);

const editDateCommonProperty = new CommonProperty(
  'any_id',
  'date',
  'editDate',
  'any_label',
  'any_id'
);

export { titleCommonProperty, creationDateCommonProperty, editDateCommonProperty };
