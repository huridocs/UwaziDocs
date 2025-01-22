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
    permissionsContext.setCommandContextAsDefault();
    setupWorkerSockets();

    systemLogger.info('[Worker] - ==> 📡 starting external services...');

    const services: Record<string, any> = {
      ocr_manager: ocrManager,
      at_service: new ATServiceListener(),
      information_extractor: new InformationExtraction(),
      convert_pdf: new ConvertToPdfWorker(),
      preserve_integration: new DistributedLoop(
        'preserve_integration',
        async () => preserveSync.syncAllTenants(),
        {
          port: config.redis.port,
          host: config.redis.host,
          delayTimeBetweenTasks: 30000,
        }
      ),
      toc_service: new DistributedLoop('toc_service', async () => tocService.processAllTenants(), {
        port: config.redis.port,
        host: config.redis.host,
        delayTimeBetweenTasks: 30000,
      }),
      sync_job: new DistributedLoop('sync_job', async () => syncWorker.runAllTenants(), {
        port: config.redis.port,
        host: config.redis.host,
        delayTimeBetweenTasks: 1000,
      }),

      pdf_segmentation: new PDFSegmentation(),
      twitter_integration: new TwitterIntegration(),
    };

    services.segmentation_distributed_loop = new DistributedLoop(
      'segmentation_repeat',
      services.pdf_segmentation.segmentPdfs,
      { port: config.redis.port, host: config.redis.host, delayTimeBetweenTasks: 5000 }
    );

    services.twitter_distributed_loop = new DistributedLoop(
      'twitter_repeat',
      services.twitter_integration.addTweetsRequestsToQueue,
      { port: config.redis.port, host: config.redis.host, delayTimeBetweenTasks: 120000 }
    );

    Object.values(services).forEach(service => service.start());

    process.on('SIGINT', async () => {
      systemLogger.info(
        '[Worker Graceful shutdown] - Received SIGINT, waiting for graceful stop...'
      );

      const stoppedServices: string[] = [];

      const stopPromises = Promise.all(
        Object.entries(services).map(async ([name, service]) => {
          await service.stop();
          stoppedServices.push(name);
        })
      );
      const firstToFinish = await Promise.race([stopPromises, sleep(10_000)]);

      if (Array.isArray(firstToFinish)) {
        systemLogger.info('[Worker Graceful shutdown] - Services stopped successfully!');
      } else {
        const notStoppedServices = Object.keys(services)
          .filter(service => !stoppedServices.includes(service))
          .join(', ');

        systemLogger.info(
          `[Worker Graceful shutdown] - These services [${notStoppedServices}] did not stop in time, initiating forceful shutdown...`
        );
      }

      process.exit(0);
    });
  })
  .catch(error => {
    throw error;
  });
