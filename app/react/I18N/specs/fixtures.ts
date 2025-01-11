import { ClientTranslationSchema } from 'app/istore';

const translations: ClientTranslationSchema[] = [
  {
    locale: 'en',
    contexts: [
      {
        id: 'System',
        label: 'System',
        values: {
          Search: 'Search',
          confirmDeleteDocument: 'Are you sure you want to delete this document?',
          confirmDeleteEntity: 'Are you sure you want to delete this entity?',
        },
      },
    ],
  },
  {
    locale: 'es',
    contexts: [
      {
        id: 'System',
        label: 'System',
        values: {
          Search: 'Buscar',
          confirmDeleteDocument: '¿Esta seguro que quiere borrar este documento?',
        },
      },
    ],
  },
];

const updatedTranslations: ClientTranslationSchema[] = [
  translations[0],
  {
    ...translations[1],
    contexts: [
      {
        ...translations[1].contexts,
        values: {
          Search: 'Buscar',
          confirmDeleteDocument: 'Actualizado!',
        },
      },
    ],
  },
];

export { translations, updatedTranslations };
