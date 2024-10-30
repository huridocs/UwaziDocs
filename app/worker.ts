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
import { getSingletonInformationExtraction } from 'api/services/informationextraction/SingletonInformationExtraction';
import { setupWorkerSockets } from 'api/socketio/setupSockets';
import { ConvertToPdfWorker } from 'api/services/convertToPDF/ConvertToPdfWorker';
import { ATServiceListener } from 'api/externalIntegrations.v2/automaticTranslation/adapters/driving/ATServiceListener';
import { handleError } from './api/utils/handleError.js';

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
      console.info('==> 📡 starting external services...');

      permissionsContext.setCommandContext();

      const servicesList = [
        ocrManager,
        new ATServiceListener(),
        getSingletonInformationExtraction(),
        new ConvertToPdfWorker(),
      ] as any[];

      const segmentationConnector = new PDFSegmentation();
      servicesList.push(segmentationConnector);

      servicesList.push(
        new DistributedLoop('segmentation_repeat', segmentationConnector.segmentPdfs, {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 5000,
        })
      );

      const twitterIntegration = new TwitterIntegration();
      servicesList.push(twitterIntegration);

      servicesList.push(
        new DistributedLoop('twitter_repeat', twitterIntegration.addTweetsRequestsToQueue, {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 120000,
        })
      );

      servicesList.push(
        new DistributedLoop('preserve_integration', async () => preserveSync.syncAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 30000,
        })
      );

      servicesList.push(
        new DistributedLoop('toc_service', async () => tocService.processAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 30000,
        })
      );

      servicesList.push(
        new DistributedLoop('sync_job', async () => syncWorker.runAllTenants(), {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 1000,
        })
      );

      servicesList.forEach(service => service.start());

      process.on('SIGINT', async () => {
        console.log('Received SIGINT, waiting for graceful stop...');
        await Promise.all(servicesList.map(async service => service.stop()));
        console.log('Graceful stop process has finished, now exiting...');

        process.exit(0);
      });
    });
  })
  .catch(error => {
    throw error;
  });
