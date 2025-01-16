import { CommonProperty } from '../CommonProperty';

const titleCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'text',
  name: 'any_title',
  label: 'any_label',
  templateId: 'any_id',
});

const creationDateCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'date',
  name: 'creationDate',
  label: 'any_label',
  templateId: 'any_id',
});

const editDateCommonProperty = new CommonProperty({
  id: 'any_id',
  type: 'date',
  name: 'editDate',
  label: 'any_label',
  templateId: 'any_id',
});

export { titleCommonProperty, creationDateCommonProperty, editDateCommonProperty };
