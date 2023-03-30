/* eslint-disable max-lines */
import { Application, NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import { Suggestions } from 'api/suggestions/suggestions';
import { InformationExtraction } from 'api/services/informationextraction/InformationExtraction';
import { validateAndCoerceRequest } from 'api/utils/validateRequest';
import { needsAuthorization } from 'api/auth';
import { parseQuery } from 'api/utils/parseQueryMiddleware';
import {
  IXSuggestionsStatsQuerySchema,
  SuggestionsQueryFilterSchema,
} from 'shared/types/suggestionSchema';
import { objectIdSchema } from 'shared/types/commonSchemas';
import { IXSuggestionsFilter, IXSuggestionsStatsQuery } from 'shared/types/suggestionType';
import { serviceMiddleware } from './serviceMiddleware';
import { ObjectIdSchema } from 'shared/types/commonTypes';

const IX = new InformationExtraction();

async function processTrainFunction(
  callback: (extractorId: ObjectIdSchema) => Promise<{ message: string; status: string }>,
  req: Request,
  res: Response
) {
  if (!IX) {
    res.status(500).json({
      error: 'Information Extraction service is not available',
    });
    return;
  }

  const status = await callback(new ObjectId(req.body.extractorId));
  res.json(status);
}

function extractorIdRequestValidation(root = 'body') {
  return validateAndCoerceRequest({
    type: 'object',
    properties: {
      [root]: {
        type: 'object',
        additionalProperties: false,
        required: ['extractorId'],
        properties: {
          extractorId: { type: 'string' },
        },
      },
    },
  });
}

// eslint-disable-next-line max-statements
export const suggestionsRoutes = (app: Application) => {
  app.get(
    '/api/suggestions/',
    serviceMiddleware,
    needsAuthorization(['admin']),
    parseQuery,
    validateAndCoerceRequest({
      type: 'object',
      properties: {
        query: {
          type: 'object',
          required: ['filter'],
          properties: {
            filter: SuggestionsQueryFilterSchema,
            page: {
              type: 'object',
              properties: {
                number: { type: 'number', minimum: 1 },
                size: { type: 'number', minimum: 1, maximum: 500 },
              },
            },
          },
        },
      },
    }),
    async (
      req: Request & {
        query: { filter: IXSuggestionsFilter; page: { number: number; size: number } };
      },
      res: Response,
      _next: NextFunction
    ) => {
      const suggestionsList = await Suggestions.get(
        { language: req.language, ...req.query.filter },
        { page: req.query.page }
      );
      res.json(suggestionsList);
    }
  );

  app.get(
    '/api/suggestions/stats',
    serviceMiddleware,
    needsAuthorization(['admin']),
    parseQuery,
    validateAndCoerceRequest({
      properties: {
        query: IXSuggestionsStatsQuerySchema,
      },
    }),
    async (
      req: Request & { query: IXSuggestionsStatsQuery },
      res: Response,
      _next: NextFunction
    ) => {
      const stats = await Suggestions.getStats(req.query.extractorId);
      res.json(stats);
    }
  );

  app.post(
    '/api/suggestions/stop',
    serviceMiddleware,
    needsAuthorization(['admin']),
    extractorIdRequestValidation('body'),
    async (req, res, _next) => {
      await processTrainFunction(IX.stopModel, req, res);
    }
  );

  app.post(
    '/api/suggestions/train',
    serviceMiddleware,
    needsAuthorization(['admin']),
    extractorIdRequestValidation('body'),
    async (req, res, _next) => {
      await processTrainFunction(IX.trainModel, req, res);
    }
  );

  app.post(
    '/api/suggestions/status',
    serviceMiddleware,
    needsAuthorization(['admin']),
    extractorIdRequestValidation('body'),
    async (req, res, _next) => {
      await processTrainFunction(IX.status, req, res);
    }
  );

  app.post(
    '/api/suggestions/accept',
    serviceMiddleware,
    needsAuthorization(['admin']),
    validateAndCoerceRequest({
      type: 'object',
      properties: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['suggestion', 'allLanguages'],
          properties: {
            suggestion: {
              type: 'object',
              additionalProperties: false,
              required: ['_id', 'sharedId', 'entityId'],
              properties: {
                _id: objectIdSchema,
                sharedId: { type: 'string' },
                entityId: { type: 'string' },
              },
            },
            allLanguages: { type: 'boolean' },
          },
        },
      },
    }),
    async (req, res, _next) => {
      const { suggestion, allLanguages } = req.body;
      await Suggestions.accept(suggestion, allLanguages);
      res.json({ success: true });
    }
  );
};
