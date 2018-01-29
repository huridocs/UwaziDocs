import mongoose from 'mongoose';

const generateID = mongoose.Types.ObjectId;
export {generateID};

export default (MongooseModel) => {
  return {
    db: MongooseModel,
    save: (data) => {
      if (Array.isArray(data)) {
        let promises = data.map((entry) => {
          if (entry._id) {
            return MongooseModel.findOneAndUpdate({_id: entry._id}, entry, {new: true, lean: true});
          }
          return MongooseModel.create(entry).then(saved => saved.toObject());
        });
        return Promise.all(promises);
      }

      if (data._id) {
        return MongooseModel.findOneAndUpdate({_id: data._id}, data, {new: true, lean: true});
      }
      return MongooseModel.create(data).then(saved => saved.toObject());
    },

    get: (query, select = '', pagination = {}) => {
      return MongooseModel.find(query, select, Object.assign({lean: true}, pagination));
    },

    count: (condition) => {
      return MongooseModel.count(condition);
    },

    getById: (id) => {
      return MongooseModel.findById(id, {}, {lean: true});
    },

    delete: (condition) => {
      let cond = condition;
      if (mongoose.Types.ObjectId.isValid(condition)) {
        cond = {_id: condition};
      }
      return MongooseModel.remove(cond);
    }
  };
};
