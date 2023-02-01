import mongoose from 'mongoose';
import { instanceModel } from 'api/odm';
import { IXExtractorType } from 'shared/types/extractorType';

const props = {
  name: { type: String, required: true },
  property: { type: String, required: true },
  templates: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'templates' }],
};

const mongoSchema = new mongoose.Schema(props, {
  strict: false,
});

// @ts-ignore
mongoSchema.index({ property: 1, templates: 1 });
mongoSchema.index({ templates: 1, property: 1 });

const IXExtractorModel = instanceModel<IXExtractorType>('ixextractors', mongoSchema);

export { IXExtractorModel };

/*
TODO: flows to consider
this:
  delete related models and suggestions when deleted
property:
    update: when updating property name, update this as well,
    delete when deleting a property from a template, remove the template, if it is there
template:
    delete: when deleting template, remove it from the templates list
*/
