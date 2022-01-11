import { catchErrors } from 'api/utils/jasmineHelpers';
import settings from 'api/settings';
import i18nRoutes from 'api/i18n/routes.js';
import instrumentRoutes from 'api/utils/instrumentRoutes';
import translations from 'api/i18n/translations';
import { Languages } from 'api/i18n/languages';

const mockSocketIo = () => ({
  emitToCurrentTenant: jasmine.createSpy('emitToCurrentTenant'),
});

describe('i18n translations routes', () => {
  let routes;
  const mockRequest = new Promise(resolve => resolve({ translations: 'response' }));

  beforeEach(() => {
    routes = instrumentRoutes(i18nRoutes);
  });

  describe('GET', () => {
    it('should return the translations', done => {
      spyOn(translations, 'get').and.returnValue(mockRequest);
      routes
        .get('/api/translations')
        .then(response => {
          expect(translations.get).toHaveBeenCalled();
          expect(response).toEqual({ rows: { translations: 'response' } });
          done();
        })
        .catch(catchErrors(done));
    });
  });

  describe('POST', () => {
    it('should have a validation schema', () => {
      expect(routes.post.validation('/api/translations')).toMatchSnapshot();
    });

    it('should save the translation', done => {
      spyOn(translations, 'save').and.returnValue(
        Promise.resolve({ contexts: [], id: 'saved_translations' })
      );
      const sockets = mockSocketIo();
      routes
        .post('/api/translations', { body: { key: 'my new key' }, sockets })
        .then(response => {
          expect(translations.save).toHaveBeenCalledWith({ key: 'my new key' });
          expect(response).toEqual({ contexts: [], id: 'saved_translations' });
          expect(sockets.emitToCurrentTenant).toHaveBeenCalledWith('translationsChange', {
            contexts: [],
            id: 'saved_translations',
          });
          done();
        })
        .catch(catchErrors(done));
    });
  });

  describe('POST /api/translations/setasdeafult', () => {
    it('should have a validation schema', () => {
      expect(routes.post.validation('/api/translations/setasdeafult')).toMatchSnapshot();
    });

    it('should update the setting', done => {
      spyOn(settings, 'setDefaultLanguage').and.returnValue(
        Promise.resolve({ site_name: 'Uwazi' })
      );
      const sockets = mockSocketIo();
      routes
        .post('/api/translations/setasdeafult', { body: { key: 'fr' }, sockets })
        .then(response => {
          expect(settings.setDefaultLanguage).toHaveBeenCalledWith('fr');
          expect(response).toEqual({ site_name: 'Uwazi' });
          expect(sockets.emitToCurrentTenant).toHaveBeenCalledWith('updateSettings', {
            site_name: 'Uwazi',
          });
          done();
        })
        .catch(catchErrors(done));
    });
  });

  describe('POST /api/translations/languages', () => {
    it('should call add method from languages', async () => {
      jest.spyOn(Languages, 'add').mockReturnValue(Promise.resolve({ newSettings: {} }));
      await routes.post('/api/translations/languages', { body: { key: 'dt', label: 'Deutsch' } });
      expect(Languages.add).toHaveBeenCalledWith({ key: 'dt', label: 'Deutsch' });
    });
  });
});
