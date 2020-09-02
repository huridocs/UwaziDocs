import fs from 'fs';
import proxy from 'express-http-proxy';

import entities from 'api/entities';
import mailer from 'api/utils/mailer';
import { search } from 'api/search';
import settings from 'api/settings';
import { processDocument } from 'api/files/processDocument';
import { uploadsPath, attachmentsPath, generateFileName } from 'api/files/filesystem';

import { validation, createError } from '../utils';
import captchaAuthorization from '../auth/captchaMiddleware';
import { uploadMiddleware } from './uploadMiddleware';

const storeFile = (pathFunction, file) =>
  new Promise((resolve, reject) => {
    const filename = generateFileName(file);
    fs.appendFile(pathFunction(filename), file.buffer, err => {
      if (err) {
        reject(err);
      }
      resolve(Object.assign(file, { filename, destination: pathFunction() }));
    });
  });

const routes = app => {
  const socket = req => req.getCurrentSessionSockets();

  app.post(
    '/api/public',
    uploadMiddleware.multiple(),
    captchaAuthorization(),
    (req, _res, next) => {
      try {
        req.body.entity = JSON.parse(req.body.entity);
        if (req.body.email) {
          req.body.email = JSON.parse(req.body.email);
        }
      } catch (err) {
        next(err);
        return;
      }
      next();
    },
    validation.validateRequest({
      properties: {
        body: {
          properties: {
            email: {
              properties: {
                to: { type: 'string' },
                from: { type: 'string' },
                text: { type: 'string' },
                html: { type: 'string' },
                subject: { type: 'string' },
              },
              required: ['to', 'from', 'text', 'subject'],
            },
          },
        },
      },
    }),
    async (req, res, next) => {
      try {
        const { allowedPublicTemplates } = await settings.get();
        const { entity, email } = req.body;

        if (!allowedPublicTemplates || !allowedPublicTemplates.includes(entity.template)) {
          next(createError('Unauthorized public template', 403));
          return;
        }

        entity.attachments = [];
        if (req.files.length) {
          await Promise.all(
            req.files
              .filter(file => file.fieldname.includes('attachment'))
              .map(file =>
                storeFile(attachmentsPath, file).then(_file => entity.attachments.push(_file))
              )
          );
        }
        const newEntity = await entities.save(entity, { user: {}, language: req.language });
        const file = req.files.find(_file => _file.fieldname.includes('file'));
        if (file) {
          storeFile(uploadsPath, file).then(async _file => {
            await processDocument(newEntity.sharedId, _file);
            await search.indexEntities({ sharedId: newEntity.sharedId }, '+fullText');
            socket(req).emit('documentProcessed', newEntity.sharedId);
          });
        }

        if (email) {
          await mailer.send(email);
        }

        res.json(newEntity);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post('/api/remotepublic', async (req, res, next) => {
    const { publicFormDestination } = await settings.get({}, { publicFormDestination: 1 });
    proxy(publicFormDestination, {
      limit: '20mb',
      proxyReqPathResolver() {
        return '/api/public';
      },
      proxyReqOptDecorator(proxyReqOpts, srcReq) {
        const options = Object.assign({}, proxyReqOpts);
        options.headers.Cookie = srcReq.session.remotecookie;
        return options;
      },
    })(req, res, next);
  });
};

export default routes;
export { routes };
