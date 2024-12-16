import { DefaultDispatcher } from 'api/queue.v2/configuration/factories';
import { TestJob } from '../../app/queueRegistry';
import { DB } from 'api/odm';
import { config } from 'api/config';

let dbAuth = {};

if (process.env.DBUSER) {
  dbAuth = {
    auth: { authSource: 'admin' },
    user: process.env.DBUSER,
    pass: process.env.DBPASS,
  };
}

(async () => {
  await DB.connect(config.DBHOST, dbAuth);
  const dispatcher = await DefaultDispatcher('default');
  for (let i = 0; i < 100; i++) {
    await dispatcher.dispatch(TestJob, {});
  }
  await DB.disconnect();
})();
