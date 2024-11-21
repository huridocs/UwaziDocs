/* eslint-disable max-statements */
import { DB } from 'api/odm';
import { config } from 'api/config';
import { tenants } from 'api/tenants';
import { permissionsContext } from 'api/permissions/permissionsContext';
import { ocrManager } from 'api/services/ocr/OcrManager';
import { PDFSegmentation } from 'api/services/pdfsegmentation/PDFSegmentation';
import { DistributedLoop } from 'api/services/tasksmanager/DistributedLoop';
import { TwitterIntegration } from 'api/services/twitterintegration/TwitterIntegration';
import { preserveSync } from 'api/services/preserve/preserveSync';
import { tocService } from 'api/toc_generation/tocService';
import { syncWorker } from 'api/sync/syncWorker';
import { InformationExtraction } from 'api/services/informationextraction/InformationExtraction';
import { setupWorkerSockets } from 'api/socketio/setupSockets';
import { ConvertToPdfWorker } from 'api/services/convertToPDF/ConvertToPdfWorker';
import { ATServiceListener } from 'api/externalIntegrations.v2/automaticTranslation/adapters/driving/ATServiceListener';
import { SystemLogger } from 'api/log.v2/infrastructure/StandardLogger';
import { sleep } from 'shared/tsUtils';
import { handleError } from './api/utils/handleError.js';

const systemLogger = SystemLogger();

let dbAuth = {};

if (process.env.DBUSER) {
  dbAuth = {
    auth: { authSource: 'admin' },
    user: process.env.DBUSER,
    pass: process.env.DBPASS,
  };
}

const uncaughtError = (error: Error) => {
  handleError(error, { uncaught: true });
  process.exit(1);
};

process.on('unhandledRejection', uncaughtError);
process.on('uncaughtException', uncaughtError);

DB.connect(config.DBHOST, dbAuth)
  .then(async () => {
    await tenants.setupTenants();
    setupWorkerSockets();

    await tenants.run(async () => {
      permissionsContext.setCommandContext();

      systemLogger.info('[Worker] - ==> 📡 starting external services...');

      const services: any[] = [
        ocrManager,
        new ATServiceListener(),
        new InformationExtraction(),
        new ConvertToPdfWorker(),
        new DistributedLoop('preserve_integration', async () => preserveSync.syncAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 30000,
        }),
        new DistributedLoop('toc_service', async () => tocService.processAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 30000,
        }),
        new DistributedLoop('sync_job', async () => syncWorker.runAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 1000,
        }),
      ];

      const segmentationConnector = new PDFSegmentation();

      const segmentationRepeater = new DistributedLoop(
        'segmentation_repeat',
        segmentationConnector.segmentPdfs,
        { port: config.redis.port, host: config.redis.host, delayTimeBetweenTasks: 5000 }
      );
      services.push(segmentationConnector, segmentationRepeater);

      const twitterIntegration = new TwitterIntegration();
      const twitterRepeater = new DistributedLoop(
        'twitter_repeat',
        twitterIntegration.addTweetsRequestsToQueue,
        { port: config.redis.port, host: config.redis.host, delayTimeBetweenTasks: 120000 }
      );
      services.push(twitterIntegration, twitterRepeater);

      services.forEach(service => service.start());

      process.on('SIGINT', async () => {
        systemLogger.info(
          '[Worker Graceful shutdown] - Received SIGINT, waiting for graceful stop...'
        );

        const stopPromises = Promise.all(services.map(async service => service.stop()));
        const firstToFinish = await Promise.race([stopPromises, sleep(10_000)]);

        if (Array.isArray(firstToFinish)) {
          systemLogger.info('[Worker Graceful shutdown] - Services stopped successfully!');
        } else {
          systemLogger.info(
            '[Worker Graceful shutdown] - Some services did not stop in time, initiating forceful shutdown...'
          );
        }

        process.exit(0);
      });
    });
  })
  .catch(error => {
    throw error;
  });
