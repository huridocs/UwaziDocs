import { catchErrors } from 'api/utils/jasmineHelpers';
import db from 'api/utils/testing_db';
import documentRoutes from '../routes.js';
import instrumentRoutes from '../../utils/instrumentRoutes';
import entities from '../entities';
import templates from '../../templates/templates';
import thesauris from '../../thesauris/thesauris';
import fixtures, { templateId } from './fixtures.js';

describe('entities', () => {
  let routes;

  beforeEach((done) => {
    routes = instrumentRoutes(documentRoutes);
    db.clearAllAndLoad(fixtures).then(done).catch(catchErrors(done));
  });

  afterAll((done) => {
    db.disconnect().then(done);
  });

  describe('POST', () => {
    let req;
    beforeEach(() => {
      req = {
        body: { title: 'Batman begins', template: templateId },
        user: { username: 'admin' },
        language: 'lang',
        io: { sockets: { emit: () => {} } }
      };
    });

    it('should need authorization', () => {
      expect(routes._post('/api/entities', req)).toNeedAuthorization();
    });

    it('should have a validation schema', () => {
      expect(routes.post.validation('/api/entities')).toMatchSnapshot();
    });

    it('should create a new document with current user', (done) => {
      spyOn(entities, 'save').and.returnValue(Promise.resolve('entity'));
      spyOn(templates, 'getById').and.returnValue(new Promise(resolve => resolve({ values: [] })));
      spyOn(thesauris, 'templateToThesauri').and.returnValue(new Promise(resolve => resolve('document')));

      routes.post('/api/entities', req)
      .then((document) => {
        expect(document).toBe('entity');
        expect(entities.save).toHaveBeenCalledWith(req.body, { user: req.user, language: 'lang' });
        done();
      });
    });

    it('should emit thesauriChange socket event with the modified thesauri based on the entity template', (done) => {
      const user = { _id: 'c08ef2532f0bd008ac5174b45e033c93', username: 'admin' };
      req = {
        body: { title: 'Batman begins', template: 'template' },
        user,
        language: 'lang',
        io: {
          sockets: {
            emit: jest.fn((event, thesauri) => {
              try {
                expect(event).toBe('thesauriChange');
                expect(thesauri).toBe('templateTransformed');
                expect(thesauris.templateToThesauri).toHaveBeenCalledWith('template', 'lang', user);
                done();
              } catch (err) {
                done.fail(err);
              }
            })
          }
        }
      };

      spyOn(entities, 'save').and.returnValue(Promise.resolve({ _id: 'id' }));
      spyOn(entities, 'getWithRelationships').and.returnValue(Promise.resolve(['entityWithRelationShips']));
      spyOn(templates, 'getById').and.returnValue(new Promise(resolve => resolve('template')));
      spyOn(thesauris, 'templateToThesauri').and.returnValue(new Promise(resolve => resolve('templateTransformed')));
      routes.post('/api/entities', req)
      .catch(catchErrors(done));
    });

    describe('get_raw_page', () => {
      it('should have a validation schema', () => {
        expect(routes.get.validation('/api/entities/get_raw_page')).toMatchSnapshot();
      });

      it('should return getRawPage', async () => {
        spyOn(entities, 'getRawPage').and.returnValue(Promise.resolve('page text'));

        const request = {
          query: { sharedId: 'sharedId', pageNumber: 2 },
          language: 'lang'
        };

        const response = await routes.get('/api/entities/get_raw_page', request);
        expect(entities.getRawPage).toHaveBeenCalledWith('sharedId', 'lang', 2);
        expect(response.data).toBe('page text');
      });
    });

    describe('/entities/multipleupdate', () => {
      beforeEach(() => {
        req = {
          body: { ids: ['1', '2'], values: { metadata: { text: 'new text' } } },
          user: { _id: 'c08ef2532f0bd008ac5174b45e033c93', username: 'admin' },
          language: 'lang'
        };
      });

      it('should need authorization', () => {
        expect(routes._post('/api/entities/multipleupdate', req)).toNeedAuthorization();
      });

      it('should have a validation schema', () => {
        expect(routes.post.validation('/api/entities/multipleupdate')).toMatchSnapshot();
      });

      it('should call multipleUpdate with the ids and the metadata in the body', (done) => {
        spyOn(entities, 'multipleUpdate').and.returnValue(new Promise(resolve => resolve([{ sharedId: '1' }, { sharedId: '2' }])));
        routes.post('/api/entities/multipleupdate', req)
        .then((response) => {
          expect(entities.multipleUpdate)
          .toHaveBeenCalledWith(
            ['1', '2'],
            { metadata: { text: 'new text' } },
            { user: { _id: 'c08ef2532f0bd008ac5174b45e033c93', username: 'admin' }, language: 'lang' }
          );
          expect(response).toEqual(['1', '2']);
          done();
        })
        .catch(catchErrors(done));
      });
    });
  });

  describe('GET', () => {
    it('should have a validation schema', () => {
      expect(routes.get.validation('/api/entities')).toMatchSnapshot();
    });
    it('should return matching document', (done) => {
      const expectedEntity = [{ sharedId: 'sharedId', published: true }];
      spyOn(entities, 'getWithRelationships').and.returnValue(Promise.resolve(expectedEntity));
      const req = {
        query: { sharedId: 'sharedId' },
        language: 'lang'
      };

      routes.get('/api/entities', req)
      .then((response) => {
        expect(entities.getWithRelationships).toHaveBeenCalledWith({ sharedId: 'sharedId', language: 'lang' });
        expect(response).toEqual({ rows: expectedEntity });
        done();
      })
      .catch(catchErrors(done));
    });

    it('should return document by id', async () => {
      const expectedEntity = { _id: '123456789012345678901234', title: 'title' };
      spyOn(entities, 'get').and.returnValue(Promise.resolve([expectedEntity]));

      const response = await routes.get('/api/entities/by_id', { query: {_id: '123456789012345678901234'} });

      expect(entities.get).toHaveBeenCalledWith({ _id: '123456789012345678901234' });
      expect(response).toEqual(expectedEntity);
    });

    it('should allow not fetching the relationships', async () => {
      const expectedEntity = { sharedId: 'sharedId', published: true };

      spyOn(entities, 'getWithRelationships');
      spyOn(entities, 'get').and.returnValue(Promise.resolve([expectedEntity]));

      const req = {
        query: { sharedId: 'sharedId', omitRelationships: true },
        language: 'lang'
      };

      const { rows: [result] } = await routes.get('/api/entities', req);
      expect(result).toBe(expectedEntity);
      expect(entities.getWithRelationships).not.toHaveBeenCalled();
      expect(entities.get).toHaveBeenCalledWith({ sharedId: 'sharedId', language: 'lang' });
    });

    describe('when the document does not exist', () => {
      it('should retunr a 404', (done) => {
        spyOn(entities, 'getWithRelationships').and.returnValue(Promise.resolve([]));
        const req = {
          query: { sharedId: 'idontexist' },
          language: 'en'
        };

        routes.get('/api/entities', req)
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        })
        .catch(catchErrors(done));
      });
    });

    describe('when the document is unpublished and not loged in', () => {
      it('should return a 404', (done) => {
        spyOn(entities, 'getWithRelationships').and.returnValue(Promise.resolve([{ published: false }]));
        const req = {
          query: { sharedId: 'unpublished' },
          language: 'en'
        };

        routes.get('/api/entities', req)
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        })
        .catch(catchErrors(done));
      });
    });

    describe('when the document has unpublished relationships and the user is unauthenticated', () => {
      it('should remove private relationships from response', async () => {
        spyOn(entities, 'getWithRelationships').and.returnValue(Promise.resolve([
          {
            sharedId: 'e1',
            published: true,
            relationships: [
              { entityData: { sharedId: 'e1', published: true } },
              { entityData: { sharedId: 'e2', published: false } },
              { entityData: { sharedId: 'e3', published: true } }
            ]
          }
        ]));

        const req = {
          query: { sharedId: 'sharedId' },
          language: 'lang'
        };

        const { rows: [result] } = await routes.get('/api/entities', req);
        expect(result).toEqual({
          sharedId: 'e1',
          published: true,
          relationships: [
            { entityData: { sharedId: 'e1', published: true } },
            { entityData: { sharedId: 'e3', published: true } }
          ]
        });
      });
    });
  });

  // describe('/api/entities/get_raw_page', () => {
  //   it('should return formattedPlainTextPages page requested', (done) => {
  //     spyOn(entities, 'countByTemplate').and.returnValue(new Promise(resolve => resolve(2)));
  //     const req = { query: { templateId: 'templateId' } };

  //     routes.get('/api/entities/count_by_template', req)
  //     .then((response) => {
  //       expect(entities.countByTemplate).toHaveBeenCalledWith('templateId');
  //       expect(response).toEqual(2);
  //       done();
  //     })
  //     .catch(catchErrors(done));
  //   });
  // });

  describe('/api/entities/count_by_template', () => {
    it('should have a validation schema', () => {
      expect(routes.get.validation('/api/entities/count_by_template')).toMatchSnapshot();
    });
    it('should return count of entities using a specific template', (done) => {
      spyOn(entities, 'countByTemplate').and.returnValue(new Promise(resolve => resolve(2)));
      const req = { query: { templateId: 'templateId' } };

      routes.get('/api/entities/count_by_template', req)
      .then((response) => {
        expect(entities.countByTemplate).toHaveBeenCalledWith('templateId');
        expect(response).toEqual(2);
        done();
      })
      .catch(catchErrors(done));
    });
  });

  describe('DELETE /api/entities', () => {
    beforeEach(() => {
      spyOn(entities, 'delete').and.returnValue(Promise.resolve({ json: 'ok' }));
    });

    it('should have a validation schema', () => {
      expect(routes.delete.validation('/api/entities')).toMatchSnapshot();
    });

    it('should use entities to delete it', (done) => {
      const req = { query: { sharedId: 123, _rev: 456 } };
      return routes.delete('/api/entities', req)
      .then(() => {
        expect(entities.delete).toHaveBeenCalledWith(req.query.sharedId);
        done();
      })
      .catch(catchErrors(done));
    });
  });

  describe('POST /api/entities/bulkdelete', () => {
    beforeEach(() => {
      spyOn(entities, 'deleteMultiple').and.returnValue(Promise.resolve({ json: 'ok' }));
    });

    it('should have a validation schema', () => {
      expect(routes.post.validation('/api/entities/bulkdelete')).toMatchSnapshot();
    });

    it('should use entities to delete it', (done) => {
      const req = { body: { sharedIds: [123, 456] } };
      return routes.post('/api/entities/bulkdelete', req)
      .then(() => {
        expect(entities.deleteMultiple).toHaveBeenCalledWith([123, 456]);
        done();
      })
      .catch(catchErrors(done));
    });
  });
});
