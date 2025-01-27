import { CommonProperty } from '../CommonProperty';
import { Property } from '../Property';

const titleCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'text',
  name: 'any_title',
  label: 'any_label',
  templateId: 'any_id',
  isCommonProperty: true,
});

const creationDateCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'date',
  name: 'creationDate',
  label: 'any_label',
  templateId: 'any_id',
  isCommonProperty: true,
});

const editDateCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'date',
  name: 'editDate',
  label: 'any_label',
  templateId: 'any_id',
  isCommonProperty: true,
});

const property = new Property({
  id: 'any_id',
  type: 'text',
  name: 'any_title',
  label: 'any_label',
  templateId: 'any_id',
  isCommonProperty: false,
});

export { property, titleCommonProperty, creationDateCommonProperty, editDateCommonProperty };
