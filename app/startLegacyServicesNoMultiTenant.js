import { config } from 'api/config';
import syncWorker from 'api/sync/syncWorker';
import settings from 'api/settings/settings';
import { Repeater } from 'api/utils/Repeater';
import { tocService } from 'api/toc_generation/tocService';
import { TaskProvider } from 'shared/tasks/tasks';

async function startLegacyServicesNoMultiTenant() {
  if (config.multiTenant || config.clusterMode) {
    return;
  }

  syncWorker.start();
  const { features } = await settings.get();
  if (features && features.tocGeneration && features.tocGeneration.url) {
    console.info('==> 🗂️ automatically generating TOCs using external service');
    const service = tocService(features.tocGeneration.url);
    const tocServiceRepeater = new Repeater(() => service.processNext(), 10000);
    tocServiceRepeater.start();
  }
  const anHour = 3600000;
  const topicClassificationRepeater = new Repeater(
    () =>
      TaskProvider.runAndWait('TopicClassificationSync', 'TopicClassificationSync', {
        mode: 'onlynew',
        noDryRun: true,
        overwrite: true,
      }),
    anHour
  );
  topicClassificationRepeater.start();
}

export { startLegacyServicesNoMultiTenant };
