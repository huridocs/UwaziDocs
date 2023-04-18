const mongodb = require('mongodb');
const yargs = require('yargs');
// eslint-disable-next-line import/no-extraneous-dependencies
const fetch = require('node-fetch');
const csv = require('@fast-csv/format');
const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');
const _ = require('lodash');

const getClient = async () => {
  const url = process.env.DBHOST ? `mongodb://${process.env.DBHOST}/` : 'mongodb://localhost/';
  const client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
  await client.connect();

  return client;
};

const getTranslationsFromDB = async () => {
  const client = await getClient();
  const db = client.db(process.env.DATABASE_NAME || 'uwazi_development');
  const translations = await db.collection('translations').find().toArray();
  client.close();
  const locToSystemContext = {};
  translations.forEach(tr => {
    const context = tr.contexts.find(c => c.id === 'System');
    const [keys, values, keyValues] = context.values.reduce(
      (newValues, currentTranslation) => {
        newValues[0].push(currentTranslation.key);
        newValues[1].push(currentTranslation.value);
        // eslint-disable-next-line no-param-reassign
        newValues[2] = { ...newValues[2], [currentTranslation.key]: currentTranslation.value };
        return newValues;
      },
      [[], [], {}]
    );
    locToSystemContext[tr.locale] = { keys, values, keyValues };
  });

  return locToSystemContext;
};

const getAvaiableLanguages = async () => {
  const url = 'https://api.github.com/repos/huridocs/uwazi-contents/contents/ui-translations';

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: process.env.GITHUB_TOKEN } : {}),
    },
  });
  const languages = await response.json();
  return languages.map(language => language.name.replace('.csv', ''));
};

const getKeysFromRepository = async locale => {
  const url = `https://api.github.com/repos/huridocs/uwazi-contents/contents/ui-translations/${locale}.csv`;

  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github.v4.raw',
      ...(process.env.GITHUB_TOKEN ? { Authorization: process.env.GITHUB_TOKEN } : {}),
    },
  });
  const fileContent = await response.text();
  const repoTranslations = await csvtojson({
    delimiter: [',', ';'],
    quote: '"',
    headers: ['key', 'value'],
  }).fromString(fileContent);

  return repoTranslations;
};

const reportResult = (keys, message) => {
  if (keys.length === 0) {
    return;
  }
  process.stdout.write(`\x1b[0m\x1b[31m    ...   ${keys.length}\x1b[31m ${message}   ...\x1b[0m\n`);
  keys.forEach(text => {
    process.stdout.write(`\x1b[0m        .  ${text}     \n`);
  });
};

const reportUntraslated = translations => {
  if (translations.length === 0) {
    return;
  }

  process.stdout.write(
    `\x1b[0m\x1b[31m    ...   ${translations.length} possible untranslated   ...\x1b[0m\n`
  );
  translations.forEach(({ key, value }) => {
    process.stdout.write(`\x1b[0m        .  ${key}\x1b[37m ${value}    \n`);
  });
};

async function updateTranslations(dbKeyValues, language, outdir) {
  // eslint-disable-next-line max-statements
  return new Promise(resolve => {
    const { locale, repositoryTranslations, obsoleteTranslations, missingTranslations } = language;
    const dirname = outdir || __dirname;
    const fileName = path.resolve(dirname, `${locale}.csv`);
    const csvFile = fs.createWriteStream(fileName);
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(csvFile).on('finish', csvFile.end);
    csvStream.write(['key', 'value']);

    const cleanedTranslations = repositoryTranslations.filter(
      t => !obsoleteTranslations.includes(t.key)
    );
    const addedTranslations = cleanedTranslations.concat(
      missingTranslations.map(t => ({ key: t, value: dbKeyValues[t] }))
    );
    const orderedTranslations = _.orderBy(addedTranslations, entry => entry.key.toLowerCase());
    orderedTranslations.forEach(row => {
      csvStream.write([row.key, row.value]);
    });
    csvStream.on('finish', resolve);
  });
}

async function processLanguage(keysFromDB, valuesFromDB, locale) {
  const repositoryTranslations = await getKeysFromRepository(locale);
  const keysInRepository = repositoryTranslations.map(translation => translation.key);
  const valuesInRepository = repositoryTranslations.map(translation => translation.value);
  const unTranslatedValues = _.intersection(valuesFromDB, valuesInRepository);
  const unTranslated = repositoryTranslations.filter(translation =>
    unTranslatedValues.includes(translation.value)
  );
  const obsoleteTranslations = _.difference(keysInRepository, keysFromDB);
  const missingTranslations = _.difference(keysFromDB, keysInRepository);
  return {
    locale,
    repositoryTranslations,
    obsoleteTranslations,
    missingTranslations,
    unTranslated,
  };
}

const reportByLanguage = language => {
  const { obsoleteTranslations, missingTranslations, unTranslated: unTranslatedKeys } = language;
  if (
    obsoleteTranslations.length > 0 ||
    missingTranslations.length > 0 ||
    unTranslatedKeys.length > 0
  ) {
    process.stdout.write(`\x1b[7m ===  ${language.locale} === \x1b[0m\x1b[37m\n`);
  }
  reportResult(missingTranslations, 'missing keys ');
  reportResult(obsoleteTranslations, 'possible obsolete translations ');
  if (unTranslatedKeys.length > 0) {
    process.stdout.write(
      `\x1b[0m\x1b[31m    ...   ${unTranslatedKeys.length} untranslated    ...\x1b[0m\n`
    );
  }
  return { obsolete: obsoleteTranslations.length, missing: missingTranslations.length };
};

// eslint-disable-next-line max-statements
async function compareTranslations(locale, update, outdir) {
  try {
    const dbTranslations = await getTranslationsFromDB();
    const keysFromDB = dbTranslations.en.keys;
    const valuesFromDB = dbTranslations.en.values;
    const dbKeyValues = dbTranslations.en.keyValues;

    const languages = locale ? [locale] : await getAvaiableLanguages();
    const result = await Promise.all(
      languages.map(language => processLanguage(keysFromDB, valuesFromDB, language))
    );

    if (result.length) {
      if (locale) {
        const [{ obsoleteTranslations, missingTranslations, unTranslated }] = result;
        reportResult(obsoleteTranslations, 'possible obsolete translations ');
        reportResult(missingTranslations, 'missing keys ');
        reportUntraslated(unTranslated);
      } else {
        const report = { obsolete: 0, missing: 0 };
        await Promise.all(
          result.map(async language => {
            if (update) {
              await updateTranslations(dbKeyValues, language, outdir);
            }
            const { obsolete, missing } = reportByLanguage(language);
            report.obsolete += obsolete;
            report.missing += missing;
          })
        );
        if (report.obsolete > 0 || report.missing > 0) {
          process.stdout.write(
            // eslint-disable-next-line max-len
            '\x1b[0m Run \x1b[7m yarn compare-translations --update --outdir=PATH/uwazi-contents/ui-translation \x1b[0m to generate files with updates for missing and obsolete keys. \n'
          );
          process.exit(1);
        } else {
          process.stdout.write('\x1b[32m All good! \x1b[0m\n');
          process.exit(0);
        }
      }
    }
  } catch (e) {
    process.stdout.write(` === An error occurred === \n ${e}\n`);
  }
}

yargs.parse();

const { argv } = yargs;
yargs.command(
  'compareTranslations',
  'compare translation between DB and Github Repository',
  {
    locale: {
      alias: 'l',
      type: 'string',
    },
    update: {
      alias: 'u',
      type: 'boolean',
    },
    outdir: {
      alias: 'o',
      type: 'string',
    },
  },
  () =>
    new Promise(resolve => {
      setTimeout(async () => {
        await compareTranslations(argv.locale, argv.update, argv.outdir);
        resolve();
      }, 3000);
    })
);

yargs.parse('compareTranslations');
