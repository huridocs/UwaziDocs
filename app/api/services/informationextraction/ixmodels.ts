import { IXModelsModel as model } from './IXModelsModel';

export default {
  get: model.get.bind(model),
  delete: model.delete.bind(model),
};
