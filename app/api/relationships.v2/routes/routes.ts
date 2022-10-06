import { Application } from 'express';

import { MongoPermissionsDataSource } from 'api/authorization.v2/database/MongoPermissionsDataSource';
import { AuthorizationService } from 'api/authorization.v2/services/AuthorizationService';
import { getClient, getConnection } from 'api/common.v2/database/getConnectionForCurrentTenant';
import { MongoIdGenerator } from 'api/common.v2/database/MongoIdGenerator';
import { MongoTransactionManager } from 'api/common.v2/database/MongoTransactionManager';
import { getValidatorMiddleware } from 'api/common.v2/validation/ajvInstances';
import { MongoEntitiesDataSource } from 'api/entities.v2/database/MongoEntitiesDataSource';
import { MongoRelationshipTypesDataSource } from 'api/relationshiptypes.v2/database/MongoRelationshipTypesDataSource';
import { User } from 'api/users.v2/model/User';
import { MongoTemplatesDataSource } from 'api/templates.v2/database/MongoTemplatesDataSource';
import needsAuthorization from '../../auth/authMiddleware';
import { MongoRelationshipsDataSource } from '../database/MongoRelationshipsDataSource';
import {
  validateRelationshipInputArray,
  validateStringArray,
} from './schemas/relationshipInputValidators';
import { CreateRelationshipService } from '../services/CreateRelationshipService';
import { DeleteRelationshipService } from '../services/DeleteRelationshipService';
import { DenormalizationService } from '../services/DenormalizationService';
import { applicationEventsBus } from 'api/eventsbus';

export default (app: Application) => {
  //   app.post(
  //     '/api/relationships.v2/bulk',
  //     needsAuthorization(['admin', 'editor', 'collaborator']),
  //     async (req, res, next) => {
  //       // the option to do saves and deletes in one endpoint
  //       res.status(418);
  //       res.json({ error: 'not implemented yet' });
  //     }
  //   );

  app.post(
    '/api/relationships.v2',
    needsAuthorization(['admin', 'editor']),
    getValidatorMiddleware(validateRelationshipInputArray),
    async (req, res) => {
      // save relationships (based on post api/references) -- currently only creates
      const user = User.fromRequest(req);
      const connection = getConnection();

      const service = new CreateRelationshipService(
        new MongoRelationshipsDataSource(connection),
        new MongoRelationshipTypesDataSource(connection),
        new MongoEntitiesDataSource(connection),
        new MongoTransactionManager(getClient()),
        MongoIdGenerator,
        new AuthorizationService(new MongoPermissionsDataSource(connection), user),
        new DenormalizationService(
          new MongoRelationshipsDataSource(connection),
          new MongoEntitiesDataSource(connection),
          new MongoTemplatesDataSource(connection),
          new MongoTransactionManager(getClient())
        ),
        applicationEventsBus
      );
      const created = await service.createMultiple(req.body);
      res.json(created);
    }
  );

  app.delete(
    '/api/relationships.v2',
    needsAuthorization(['admin', 'editor']),
    getValidatorMiddleware(validateStringArray),
    async (req, res) => {
      // save relationships (based on post api/references) -- currently only creates
      const user = User.fromRequest(req);
      const connection = getConnection();

      const service = new DeleteRelationshipService(
        new MongoRelationshipsDataSource(connection),
        new MongoTransactionManager(getClient()),
        new AuthorizationService(new MongoPermissionsDataSource(connection), user)
      );
      const created = await service.deleteMultiple(req.body);
      res.json(created);
    }
  );

  //   app.get(
  //     '/api/relationships.v2/by_entity/',
  //     // validation.validateRequest(
  //     //   Joi.object()
  //     //     .keys({
  //     //       sharedId: Joi.string().required(),
  //     //       file: Joi.string(),
  //     //       onlyTextReferences: Joi.string(),
  //     //     })
  //     //     .required(),
  //     //   'query'
  //     // ),
  //     (req, res, next) => {
  //       // get references for an entity, based on get /api/references/by_document/
  //       res.status(418);
  //       res.json({ error: 'not implemented yet' });
  //     }
  //   );

  //   // how does this group?
  //   // app.get('/api/references/group_by_connection/', (req, res, next) => {
  //   //   relationships
  //   //     .getGroupsByConnection(req.query.sharedId, req.language, {
  //   //       excludeRefs: true,
  //   //       user: req.user,
  //   //     })
  //   //     .then(response => {
  //   //       res.json(response);
  //   //     })
  //   //     .catch(next);
  //   // });

  //   // what does this do?
  //   // app.get(
  //   //   '/api/references/search/',
  //   //   validation.validateRequest(
  //   //     Joi.object().keys({
  //   //       sharedId: Joi.string().allow(''),
  //   //       filter: Joi.string().allow(''),
  //   //       limit: Joi.string().allow(''),
  //   //       sort: Joi.string().allow(''),
  //   //       order: Joi.string(),
  //   //       treatAs: Joi.string(),
  //   //       searchTerm: Joi.string().allow(''),
  //   //     }),
  //   //     'query'
  //   //   ),
  //   //   (req, res, next) => {
  //   //     req.query.filter = JSON.parse(req.query.filter || '{}');
  //   //     const { sharedId, ...query } = req.query;
  //   //     relationships
  //   //       .search(req.query.sharedId, query, req.language, req.user)
  //   //       .then(results => res.json(results))
  //   //       .catch(next);
  //   //   }
  //   // );

  //   app.get(
  //     '/api/relationships.v2/count_by_relationtype',
  //     // validation.validateRequest(
  //     //   Joi.object()
  //     //     .keys({
  //     //       relationtypeId: Joi.objectId().required(),
  //     //     })
  //     //     .required(),
  //     //   'query'
  //     // ),
  //     (req, res, next) => {
  //       // a count aggregation on relationtype
  //       res.status(418);
  //       res.json({ error: 'not implemented yet' });
  //     }
  //   );
};
