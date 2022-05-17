import { Application, NextFunction } from 'express';
import request from 'supertest';
import { setUpApp } from 'api/utils/testingRoutes';
import { testingEnvironment } from 'api/utils/testingEnvironment';
import translations from 'api/i18n';
import templateRoutes from '../routes';
import templates from '../templates';
import { templateCommonProperties, fixtures, fixtureFactory } from './fixtures/routesFixtures';

jest.mock(
  '../../auth/authMiddleware.ts',
  () => () => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  }
);

jest.mock(
  '../../utils/languageMiddleware.ts',
  () => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  }
);

const templateToSave = {
  name: 'template4',
  properties: [],
  commonProperties: templateCommonProperties,
};

const syncedTemplateToSave = {
  name: 'template5',
  properties: [],
  commonProperties: templateCommonProperties,
  synced: true,
};

const emitToCurrentTenantSpy = jasmine.createSpy('emitToCurrentTenant');

describe('templates routes', () => {
  const app: Application = setUpApp(templateRoutes, (req, _res, next: NextFunction) => {
    req.sockets = { emitToCurrentTenant: emitToCurrentTenantSpy };
    next();
  });

  const postToEnpoint = async (route: string, body: any, expectedCode = 200) =>
    request(app).post(route).send(body).expect(expectedCode);

  beforeEach(async () => {
    await testingEnvironment.setUp(fixtures, 'templates_index');
    spyOn(translations, 'updateContext').and.returnValue(Promise.resolve());
  });

  afterAll(async () => testingEnvironment.tearDown());

  describe('GET', () => {
    it('should return all templates by default', async () => {
      const { body } = await request(app).get('/api/templates').expect(200);

      expect(JSON.stringify(body.rows)).toBe(JSON.stringify(fixtures.templates));
    });
  });

  describe('DELETE', () => {
    it('should delete a template', async () => {
      const templateId = fixtureFactory.id('template2');
      await request(app).delete(`/api/templates?_id=${templateId}`).expect(200);
      const remainingTemplates = await templates.get();
      expect(remainingTemplates).toContainEqual(expect.objectContaining({ name: 'template1' }));
      expect(remainingTemplates).toContainEqual(expect.objectContaining({ name: 'template3' }));
      expect(remainingTemplates).not.toContainEqual(expect.objectContaining({ name: 'template2' }));
    });

    it('should validate that request has _id', async () => {
      const { body } = await request(app).delete('/api/templates').expect(400);
      expect(body.error).toBe('validation failed');
    });
  });

  describe('POST', () => {
    it('should create a template', async () => {
      await postToEnpoint('/api/templates', templateToSave);

      const savedTemplates = await templates.get();

      expect(savedTemplates).toContainEqual(expect.objectContaining({ name: 'template4' }));
    });

    it('should update a existing template', async () => {
      const [firstTemplate] = await templates.get();
      const templateToUpdate = {
        ...firstTemplate,
        properties: [{ label: 'Numeric', type: 'numeric' }],
        commonProperties: templateCommonProperties,
        __v: 0,
      };

      await postToEnpoint('/api/templates', templateToUpdate);

      const [updatedTemplate] = await templates.get({ _id: templateToUpdate._id });
      expect(updatedTemplate.properties).toContainEqual(
        expect.objectContaining({ label: 'Numeric', type: 'numeric' })
      );
    });

    it('should not emit settings update when settings not modified', async () => {
      await postToEnpoint('/api/templates', templateToSave);

      expect(emitToCurrentTenantSpy).not.toHaveBeenCalledWith('updateSettings');
    });

    it('should not reindex when saving a synced template', async () => {
      const templateSaveSpy = spyOn(templates, 'save').and.returnValue({
        _id: 'savedid',
        name: 'template5',
      });

      await postToEnpoint('/api/templates', syncedTemplateToSave);

      expect(templateSaveSpy).toHaveBeenCalledWith(syncedTemplateToSave, undefined, false, false);
    });
  });

  describe('/templates/count_by_thesauri', () => {
    it('should return the number of templates using a thesauri', async () => {
      const { body } = await request(app)
        .get('/api/templates/count_by_thesauri?_id=123456789')
        .expect(200);

      expect(body).toBe(1);
    });
    it('should have a validation schema', async () => {
      const { body } = await request(app).get('/api/templates/count_by_thesauri');
      expect(body.error).toBe('validation failed');
    });
  });

  describe('/api/templates/setasdefault', () => {
    it('should call templates to set the new default', async () => {
      const template2Id = fixtureFactory.id('template2');
      await request(app).post('/api/templates/setasdefault').send({ _id: template2Id }).expect(200);

      const savedTemplates = await templates.get();

      expect(savedTemplates).toContainEqual(
        expect.objectContaining({ name: 'template1', default: false })
      );
      expect(savedTemplates).toContainEqual(
        expect.objectContaining({ name: 'template2', default: true })
      );
    });

    it('should have a validation schema', async () => {
      const { body } = await request(app).post('/api/templates/setasdefault');
      expect(body.error).toBe('validation failed');
    });
  });

  describe('mappings', () => {
    it('should throw an error if template is invalid vs the current elasticsearch mapping', async () => {
      await postToEnpoint('/api/templates', {
        ...templateToSave,
        properties: [
          {
            label: 'Numeric',
            type: 'numeric',
            name: 'numeric',
          },
        ],
      });
      const savedTemplate = await templates.get({ name: 'template4' });
      await postToEnpoint('/api/templates', {
        ...savedTemplate[0],
        properties: [],
      });
      const { body } = await postToEnpoint(
        '/api/templates',
        {
          ...savedTemplate[0],
          properties: [
            {
              label: 'Numeric',
              type: 'text',
              name: 'numeric',
            },
          ],
          reindex: false,
        },
        409
      );
      expect(body.error).toContain('conflict');
    });

    it('should throw an error if template is reusing a property name in same operation', async () => {
      await postToEnpoint('/api/templates', {
        ...templateToSave,
        properties: [
          {
            label: 'Numeric',
            type: 'numeric',
            name: 'numeric',
          },
        ],
      });
      const savedTemplate = await templates.get({ name: 'template4' });

      const { body } = await postToEnpoint(
        '/api/templates',
        {
          ...savedTemplate[0],
          properties: [
            {
              label: 'Numeric',
              type: 'text',
              name: 'numeric',
            },
          ],
          reindex: false,
        },
        400
      );

      expect(body.error).toContain('swap');
    });
  });
});
