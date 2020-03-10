import Joi from 'joi';
import settings from 'api/settings/settings';
import { validation } from '../utils';
import needsAuthorization from '../auth/authMiddleware';

export default app => {
  app.post(
    '/api/settings',
    needsAuthorization(),
    validation.validateRequest(
      Joi.object()
        .keys({
          _id: Joi.objectId(),
          __v: Joi.number(),
          project: Joi.string(),
          site_name: Joi.string().allow(''),
          contactEmail: Joi.string().allow(''),
          home_page: Joi.string().allow(''),
          private: Joi.boolean(),
          cookiepolicy: Joi.boolean(),
          mailerConfig: Joi.string().allow(''),
          publicFormDestination: Joi.string().allow(''),
          allowedPublicTemplates: Joi.array().items(Joi.string()),
          analyticsTrackingId: Joi.string().allow(''),
          matomoConfig: Joi.string().allow(''),
          dateFormat: Joi.string().allow(''),
          custom: Joi.any(),
          customCSS: Joi.string().allow(''),
          languages: Joi.array().items(
            Joi.object().keys({
              _id: Joi.string(),
              key: Joi.string(),
              label: Joi.string(),
              rtl: Joi.boolean(),
              default: Joi.boolean(),
            })
          ),
          filters: Joi.array().items(
            Joi.object().keys({
              _id: Joi.string(),
              id: Joi.string(),
              name: Joi.string(),
              items: Joi.any(),
            })
          ),
          links: Joi.array().items(
            Joi.object().keys({
              _id: Joi.string(),
              localID: Joi.string(),
              title: Joi.string(),
              url: Joi.string(),
            })
          ),
          features: Joi.object().keys({
            semanticSearch: Joi.boolean(),
          }),
        })
        .required()
    ),
    (req, res, next) => {
      settings
        .save(req.body)
        .then(response => res.json(response))
        .catch(next);
    }
  );

  app.get('/api/settings', (req, res, next) => {
    const select = req.user && req.user.role === 'admin' ? '+publicFormDestination' : {};
    settings
      .get({}, select)
      .then(response => res.json(response))
      .catch(next);
  });
};
