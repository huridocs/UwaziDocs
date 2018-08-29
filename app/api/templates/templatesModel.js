import mongoose from 'mongoose';

const propertiesSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: String,
  content: String,
  relationType: String,
  name: String,
  filter: Boolean,
  defaultfilter: Boolean,
  required: Boolean,
  sortable: Boolean,
  showInCard: Boolean,
  preview: Boolean,
  prioritySorting: Boolean,
  nestedProperties: [String]
});

const commonPropertiesSchema = new mongoose.Schema({
  isCommonProperty: Boolean,
  label: String,
  name: String,
  type: String,
  prioritySorting: Boolean
});

const templateSchema = new mongoose.Schema({
  name: String,
  isEntity: Boolean,
  properties: [propertiesSchema],
  commonProperties: [commonPropertiesSchema]
});

const Model = mongoose.model('templates', templateSchema);
export default Model;
