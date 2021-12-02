import { Application } from 'express';
import { Suggestions } from 'api/suggestions/suggestions';
import { InformationExtraction } from 'api/services/informationextraction/InformationExtraction';
import { parseQuery } from 'api/utils/parseQueryMiddleware';
import { validateAndCoerceRequest } from 'api/utils/validateRequest';
import { needsAuthorization } from 'api/auth';
import { IXSuggestionsQuerySchema } from 'shared/types/suggestionSchema';
import { config } from 'api/config';
import { propertyValueSchema } from 'shared/types/commonSchemas';

let IX: InformationExtraction;
if (config.externalServices) {
  IX = new InformationExtraction();
}

export const suggestionsRoutes = (app: Application) => {
  app.get(
    '/api/suggestions/',
    needsAuthorization(['admin']),
    parseQuery,
    validateAndCoerceRequest({
      properties: {
        query: IXSuggestionsQuerySchema,
      },
    }),
    async (req, res, _next) => {
      const suggestionsList = await Suggestions.get(
        { language: req.language, ...req.query.filter },
        { page: req.query.page }
      );
      res.json(suggestionsList);
    }
  );

  app.post(
    '/api/suggestions/train',
    validateAndCoerceRequest({
      properties: {
        property: { type: 'string' },
      },
    }),
    async (req, res, _next) => {
      if (!IX) {
        res.status(500).json({
          error: 'Information Extraction service is not available',
        });
        return;
      }
      const status = await IX.trainModel(req.body.property);
      res.json(status);
    }
  );

  app.get(
    '/api/suggestions/status',
    validateAndCoerceRequest({
      properties: {
        query: { property: { type: 'string' } },
      },
    }),
    async (req, res, _next) => {
      if (!IX) {
        res.status(500).json({
          error: 'Information Extraction service is not available',
        });
        return;
      }
      const status = await IX.status(req.query.property);
      res.json(status);
    }
  );

  app.post(
    '/api/suggestions/accept',
    validateAndCoerceRequest({
      properties: {
        suggestion: propertyValueSchema,
        allLanguages: { type: 'string' },
      },
    }),
    async (req, res, _next) => {
      const { suggestion, allLanguages } = req.body;
      const status = await Suggestions.accept(suggestion, allLanguages);
      res.json(status);
    }
  );
};
