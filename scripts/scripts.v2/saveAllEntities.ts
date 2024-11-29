import { DB } from 'api/odm';
import { config } from 'api/config';
import { tenants } from 'api/tenants';

import { DefaultTransactionManager } from 'api/common.v2/database/data_source_defaults';
import { DefaultSettingsDataSource } from 'api/settings.v2/database/data_source_defaults';
import entities from 'api/entities/entities';
import { permissionsContext } from 'api/permissions/permissionsContext';

const { tenant, allTenants } = require('yargs')
  .option('tenant', {
    alias: 't',
    type: 'string',
    describe: 'Tenant to use',
    default: undefined,
  })
  .option('allTenants', {
    alias: 'a',
    type: 'boolean',
    describe: 'All tenants',
    default: false,
  }).argv;

let dbAuth = {};

if (process.env.DBUSER) {
  dbAuth = {
    auth: { authSource: 'admin' },
    user: process.env.DBUSER,
    pass: process.env.DBPASS,
  };
}

const LINE_PREFIX = process.env.LINE_PREFIX || '%> ';

function print(content: any, error?: 'error') {
  process[error ? 'stderr' : 'stdout'].write(`${LINE_PREFIX}${JSON.stringify(content)}\n`);
}

async function handleTenant(tenantName: string) {
  await tenants.run(async () => {
    const start = process.hrtime();

    permissionsContext.setCommandContext();

    const settings = DefaultSettingsDataSource(DefaultTransactionManager());
    const defaultLanguage = await settings.getDefaultLanguageKey();

    const sharedIDs = await entities.getUnrestricted({language: defaultLanguage}, 'sharedId', {});

    let entitiesProcessed = 0;
    const errors: any[] = [];

    await sharedIDs.reduce(async (prev, entity) => {
      await prev;
      const sharedId = entity.sharedId;
      const [entityToSave] = await entities.getUnrestricted({sharedId, language: defaultLanguage});
      try {
        print({updating: `${entityToSave.title} | ${entityToSave.sharedId}`});
        await entities.save(
          entityToSave,
          { user: 'not needed?', language: defaultLanguage },
          { includeDocuemnts: false}
        );
        entitiesProcessed += 1;
      } catch (e) {
        const error = {tenant, sharedId, error: e};
        errors.push(error);
      }
      return Promise.resolve();
    }, Promise.resolve());

    const [seconds, nanoseconds] = process.hrtime(start);
    const elapsedTime = seconds + nanoseconds / 1e9;

    print({
      logType: 'summary',
      tenant: tenantName,
      entitiesFetched: sharedIDs.length,
      correctlyProcessed: entitiesProcessed,
      notProcessed: errors.length,
      elapsedTime: `${elapsedTime.toFixed(3)} s`,
      errors: errors
    })

  }, tenantName);
}

(async function run() {
  await DB.connect(config.DBHOST, dbAuth);
  await tenants.setupTenants();

  if (!allTenants) {
    await handleTenant(tenant);
  } else {
    await Object.keys(tenants.tenants).reduce(async (prev, tenantName) => {
      await prev;
      await handleTenant(tenantName);
    }, Promise.resolve());
  }
  await tenants.model?.closeChangeStream();
  await DB.disconnect();
})();
