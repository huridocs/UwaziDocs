import 'api/entities';
import urljoin from 'url-join';
import request from 'shared/JSONRequest';
import { SettingsSyncSchema } from 'shared/types/settingsType';
import { tenants } from 'api/tenants';
import settings from 'api/settings';
import { permissionsContext } from 'api/permissions/permissionsContext';
import { synchronizer } from './synchronizer';
import { createSyncConfig } from './syncConfig';
import syncsModel from './syncsModel';

const updateSyncs = async (name: string, collection: string, lastSync: number) =>
  syncsModel._updateMany({ name }, { $set: { [`lastSyncs.${collection}`]: lastSync } }, {});

async function createSyncIfNotExists(config: SettingsSyncSchema) {
  const syncs = await syncsModel.find({ name: config.name });
  if (syncs.length === 0) {
    await syncsModel.create([{ lastSyncs: {}, name: config.name }]);
  }
}

class InvalidSyncConfig extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSyncConfig';
  }
}

interface SyncConfig {
  url: string;
  username: string;
  active?: boolean;
  password: string;
  name: string;
  config: {
    templates?: {
      [k: string]: {
        properties: string[];
        filter?: string;
      };
    };
    relationtypes?: string[];
  };
}

const validateConfig = (config: SettingsSyncSchema) => {
  if (!config.name) throw new InvalidSyncConfig('Name is not defined on sync config');
  if (!config.url) throw new InvalidSyncConfig('url is not defined on sync config');
  if (!config.config) throw new InvalidSyncConfig('config is not defined on sync config');
  return config as SyncConfig;
};

export const syncWorker = {
  UPDATE_LOG_TARGET_COUNT: 50,

  async runAllTenants() {
    return tenants.getTenantsForFeatureFlag('sync').reduce(async (previous, tenant) => {
      await previous;
      return tenants.run(async () => {
        permissionsContext.setCommandContext();
        const { sync } = await settings.get({}, 'sync');
        if (sync) {
          await this.syncronize(sync);
        }
      }, tenant.name);
    }, Promise.resolve());
  },

  async syncronize(syncSettings: SettingsSyncSchema[]) {
    await syncSettings.reduce(async (previousSync, config) => {
      await previousSync;
      const syncConfig = validateConfig(config);
      if (!syncConfig?.active) return;

      await this.syncronizeConfig(syncConfig);
    }, Promise.resolve());
  },

  async syncronizeConfig(config: SyncConfig) {
    await createSyncIfNotExists(config);

    const syncConfig = await createSyncConfig(config, config.name, this.UPDATE_LOG_TARGET_COUNT);

    const lastChanges = await syncConfig.lastChanges();

    if (lastChanges.length) {
      const cookie = await this.login(config);

      await lastChanges.reduce(async (previousChange, change) => {
        await previousChange;
        const shouldSync: { skip?: boolean; data?: any } = await syncConfig.shouldSync(change);
        if (shouldSync.skip) {
          await synchronizer.syncDelete(change, config.url, cookie);
        }

        if (shouldSync.data) {
          await synchronizer.syncData(
            {
              url: config.url,
              change,
              data: shouldSync.data,
              cookie,
            },
            'post'
          );
        }
        await updateSyncs(config.name, change.namespace, change.timestamp);
      }, Promise.resolve());
    }
  },

  async login({ url, username, password }: SyncConfig) {
    const response = await request.post(urljoin(url, 'api/login'), { username, password });

    return response.cookie || '';
  },
};

export type { SyncConfig };
