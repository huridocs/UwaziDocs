/* eslint-disable max-lines */
import { LanguageSchema } from 'shared/types/commonTypes';

type LanguageCode = 'elastic' | 'ISO639_3' | 'ISO639_1';

const otherLanguageSchema: LanguageSchema = {
  label: 'Other',
  key: 'other' as any,
  ISO639_1: 'other' as any,
  ISO639_3: 'other',
  elastic: 'other',
  localized_label: 'Other',
  translationAvailable: false,
};

const availableLanguages: LanguageSchema[] = [
  {
    label: 'Abkhazian',
    key: 'ab',
    ISO639_3: 'abk',
    ISO639_1: 'ab',
    localized_label: 'Abkhazian',
    translationAvailable: false,
  },
  {
    label: 'Afar',
    key: 'aa',
    ISO639_3: 'aar',
    ISO639_1: 'aa',
    localized_label: 'Afar',
    translationAvailable: false,
  },
  {
    label: 'Afrikaans',
    key: 'af',
    ISO639_3: 'afr',
    ISO639_1: 'af',
    localized_label: 'Afrikaans',
    translationAvailable: false,
  },
  {
    label: 'Akan',
    key: 'ak',
    ISO639_3: 'aka',
    ISO639_1: 'ak',
    localized_label: 'Akan',
    translationAvailable: false,
  },
  {
    label: 'Albanian',
    key: 'sq',
    ISO639_3: 'sqi',
    ISO639_1: 'sq',
    localized_label: 'Shqip',
    translationAvailable: false,
  },
  {
    label: 'Amharic',
    key: 'am',
    ISO639_3: 'amh',
    ISO639_1: 'am',
    localized_label: 'አማርኛ',
    translationAvailable: false,
  },
  {
    label: 'Arabic',
    key: 'ar',
    rtl: true,
    ISO639_3: 'arb',
    elastic: 'arabic',
    ISO639_1: 'ar',
    localized_label: 'العربية',
    translationAvailable: false,
  },
  {
    label: 'Aragonese',
    key: 'an',
    ISO639_3: 'arg',
    ISO639_1: 'an',
    localized_label: 'Aragonese',
    translationAvailable: false,
  },
  {
    label: 'Armenian',
    key: 'hy',
    ISO639_3: 'hye',
    elastic: 'armenian',
    ISO639_1: 'hy',
    localized_label: 'Հայերեն',
    translationAvailable: false,
  },
  {
    label: 'Assamese',
    key: 'as',
    ISO639_3: 'asm',
    ISO639_1: 'as',
    localized_label: 'অসমীয়া',
    translationAvailable: false,
  },
  {
    label: 'Avaric',
    key: 'av',
    ISO639_3: 'ava',
    ISO639_1: 'av',
    localized_label: 'Avaric',
    translationAvailable: false,
  },
  {
    label: 'Avestan',
    key: 'ae',
    ISO639_3: 'ave',
    ISO639_1: 'ae',
    localized_label: 'Avestan',
    translationAvailable: false,
  },
  {
    label: 'Aymara',
    key: 'ay',
    ISO639_3: 'aym',
    ISO639_1: 'ay',
    localized_label: 'Aymara',
    translationAvailable: false,
  },
  {
    label: 'Azerbaijani',
    key: 'az',
    ISO639_3: 'aze',
    ISO639_1: 'az',
    localized_label: 'Azərbaycan',
    translationAvailable: false,
  },
  {
    label: 'Bambara',
    key: 'bm',
    ISO639_3: 'bam',
    ISO639_1: 'bm',
    localized_label: 'Bamanakan',
    translationAvailable: false,
  },
  {
    label: 'Bashkir',
    key: 'ba',
    ISO639_3: 'bak',
    ISO639_1: 'ba',
    localized_label: 'Bashkir',
    translationAvailable: false,
  },
  {
    label: 'Basque',
    key: 'eu',
    ISO639_3: 'eus',
    elastic: 'basque',
    ISO639_1: 'eu',
    localized_label: 'Euskara',
    translationAvailable: false,
  },
  {
    label: 'Belarusian',
    key: 'be',
    ISO639_3: 'bel',
    ISO639_1: 'be',
    localized_label: 'Беларуская',
    translationAvailable: false,
  },
  {
    label: 'Bengali (Bangla)',
    key: 'bn',
    ISO639_3: 'ben',
    ISO639_1: 'bn',
    localized_label: 'বাংলা',
    translationAvailable: false,
  },
  {
    label: 'Bihari',
    key: 'bh',
    ISO639_3: 'bih',
    ISO639_1: 'bh',
    localized_label: 'Bhojpuri',
    translationAvailable: false,
  },
  {
    label: 'Bislama',
    key: 'bi',
    ISO639_3: 'bis',
    ISO639_1: 'bi',
    localized_label: 'Bislama',
    translationAvailable: false,
  },
  {
    label: 'Bosnian',
    key: 'bs',
    ISO639_3: 'bos',
    ISO639_1: 'bs',
    localized_label: 'Bosanski',
    translationAvailable: false,
  },
  {
    label: 'Breton',
    key: 'br',
    ISO639_3: 'bre',
    ISO639_1: 'br',
    localized_label: 'Brezhoneg',
    translationAvailable: false,
  },
  {
    label: 'Bulgarian',
    key: 'bg',
    ISO639_3: 'bul',
    elastic: 'bulgarian',
    ISO639_1: 'bg',
    localized_label: 'Български',
    translationAvailable: false,
  },
  {
    label: 'Burmese',
    key: 'my',
    ISO639_3: 'mya',
    ISO639_1: 'my',
    localized_label: 'မြန်မာ',
    translationAvailable: false,
  },
  {
    label: 'Catalan',
    key: 'ca',
    ISO639_3: 'cat',
    elastic: 'catalan',
    ISO639_1: 'ca',
    localized_label: 'Català',
    translationAvailable: false,
  },
  {
    label: 'Chamorro',
    key: 'ch',
    ISO639_3: 'cha',
    ISO639_1: 'ch',
    localized_label: 'Chamorro',
    translationAvailable: false,
  },
  {
    label: 'Chechen',
    key: 'ce',
    ISO639_3: 'che',
    ISO639_1: 'ce',
    localized_label: 'Нохчийн',
    translationAvailable: false,
  },
  {
    label: 'Chichewa, Chewa, Nyanja',
    key: 'ny',
    ISO639_3: 'nya',
    ISO639_1: 'ny',
    localized_label: 'Nyanja',
    translationAvailable: false,
  },
  {
    label: 'Chinese',
    key: 'zh',
    ISO639_3: 'zho',
    elastic: 'cjk',
    ISO639_1: 'zh',
    localized_label: '中文',
    translationAvailable: false,
  },
  {
    label: 'Chinese (Simplified)',
    key: 'zh-Hans',
    ISO639_3: 'zho-Hans',
    elastic: 'cjk',
    ISO639_1: 'zh-Hans',
    localized_label: '简体中文',
    translationAvailable: false,
  },
  {
    label: 'Chinese (Traditional)',
    key: 'zh-Hant',
    ISO639_3: 'zho-Hant',
    elastic: 'cjk',
    ISO639_1: 'zh-Hant',
    localized_label: '繁體中文',
    translationAvailable: false,
  },
  {
    label: 'Chuvash',
    key: 'cv',
    ISO639_3: 'chv',
    ISO639_1: 'cv',
    localized_label: 'Chuvash',
    translationAvailable: false,
  },
  {
    label: 'Cornish',
    key: 'kw',
    ISO639_3: 'cor',
    ISO639_1: 'kw',
    localized_label: 'Kernewek',
    translationAvailable: false,
  },
  {
    label: 'Corsican',
    key: 'co',
    ISO639_3: 'cos',
    ISO639_1: 'co',
    localized_label: 'Corsican',
    translationAvailable: false,
  },
  {
    label: 'Cree',
    key: 'cr',
    ISO639_3: 'cre',
    ISO639_1: 'cr',
    localized_label: 'Cree',
    translationAvailable: false,
  },
  {
    label: 'Croatian',
    key: 'hr',
    ISO639_3: 'hrv',
    ISO639_1: 'hr',
    localized_label: 'Hrvatski',
    translationAvailable: false,
  },
  {
    label: 'Czech',
    key: 'cs',
    ISO639_3: 'ces',
    elastic: 'czech',
    ISO639_1: 'cs',
    localized_label: 'Čeština',
    translationAvailable: false,
  },
  {
    label: 'Danish',
    key: 'da',
    ISO639_3: 'dan',
    elastic: 'danish',
    ISO639_1: 'da',
    localized_label: 'Dansk',
    translationAvailable: false,
  },
  {
    label: 'Divehi, Dhivehi, Maldivian',
    key: 'dv',
    rtl: true,
    ISO639_3: 'div',
    ISO639_1: 'dv',
    localized_label: 'Divehi',
    translationAvailable: false,
  },
  {
    label: 'Dutch',
    key: 'nl',
    ISO639_3: 'nld',
    elastic: 'dutch',
    ISO639_1: 'nl',
    localized_label: 'Nederlands',
    translationAvailable: false,
  },
  {
    label: 'Dzongkha',
    key: 'dz',
    ISO639_3: 'dzo',
    ISO639_1: 'dz',
    localized_label: 'རྫོང་ཁ',
    translationAvailable: false,
  },
  {
    label: 'English',
    key: 'en',
    ISO639_3: 'eng',
    elastic: 'english',
    ISO639_1: 'en',
    localized_label: 'English',
    translationAvailable: false,
  },
  {
    label: 'Esperanto',
    key: 'eo',
    ISO639_3: 'epo',
    ISO639_1: 'eo',
    localized_label: 'Esperanto',
    translationAvailable: false,
  },
  {
    label: 'Estonian',
    key: 'et',
    ISO639_3: 'est',
    ISO639_1: 'et',
    localized_label: 'Eesti',
    translationAvailable: false,
  },
  {
    label: 'Ewe',
    key: 'ee',
    ISO639_3: 'ewe',
    ISO639_1: 'ee',
    localized_label: 'Eʋegbe',
    translationAvailable: false,
  },
  {
    label: 'Faroese',
    key: 'fo',
    ISO639_3: 'fao',
    ISO639_1: 'fo',
    localized_label: 'Føroyskt',
    translationAvailable: false,
  },
  {
    label: 'Fijian',
    key: 'fj',
    ISO639_3: 'fij',
    ISO639_1: 'fj',
    localized_label: 'Fijian',
    translationAvailable: false,
  },
  {
    label: 'Finnish',
    key: 'fi',
    ISO639_3: 'fin',
    elastic: 'finnish',
    ISO639_1: 'fi',
    localized_label: 'Suomi',
    translationAvailable: false,
  },
  {
    label: 'French',
    key: 'fr',
    ISO639_3: 'fra',
    elastic: 'french',
    ISO639_1: 'fr',
    localized_label: 'Français',
    translationAvailable: false,
  },
  {
    label: 'Fula, Fulah, Pulaar, Pular',
    key: 'ff',
    ISO639_3: 'ful',
    ISO639_1: 'ff',
    localized_label: 'Pulaar',
    translationAvailable: false,
  },
  {
    label: 'Galician',
    key: 'gl',
    ISO639_3: 'glg',
    elastic: 'galician',
    ISO639_1: 'gl',
    localized_label: 'Galego',
    translationAvailable: false,
  },
  {
    label: 'Gaelic Scottish',
    key: 'gd',
    ISO639_3: 'gla',
    ISO639_1: 'gd',
    localized_label: 'Gàidhlig',
    translationAvailable: false,
  },
  {
    label: 'Gaelic (Manx)',
    key: 'gv',
    ISO639_3: 'glv',
    ISO639_1: 'gv',
    localized_label: 'Gaelg',
    translationAvailable: false,
  },
  {
    label: 'Georgian',
    key: 'ka',
    ISO639_3: 'kat',
    ISO639_1: 'ka',
    localized_label: 'Ქართული',
    translationAvailable: false,
  },
  {
    label: 'German',
    key: 'de',
    ISO639_3: 'deu',
    elastic: 'german',
    ISO639_1: 'de',
    localized_label: 'Deutsch',
    translationAvailable: false,
  },
  {
    label: 'Greek',
    key: 'el',
    ISO639_3: 'ell',
    elastic: 'greek',
    ISO639_1: 'el',
    localized_label: 'Ελληνικά',
    translationAvailable: false,
  },
  {
    label: 'Guarani',
    key: 'gn',
    ISO639_3: 'grn',
    ISO639_1: 'gn',
    localized_label: 'Guarani',
    translationAvailable: false,
  },
  {
    label: 'Gujarati',
    key: 'gu',
    ISO639_3: 'guj',
    ISO639_1: 'gu',
    localized_label: 'ગુજરાતી',
    translationAvailable: false,
  },
  {
    label: 'Haitian Creole',
    key: 'ht',
    ISO639_3: 'hat',
    ISO639_1: 'ht',
    localized_label: 'Haitian Creole',
    translationAvailable: false,
  },
  {
    label: 'Hausa',
    key: 'ha',
    rtl: true,
    ISO639_3: 'hau',
    ISO639_1: 'ha',
    localized_label: 'Hausa',
    translationAvailable: false,
  },
  {
    label: 'Hebrew',
    key: 'he',
    rtl: true,
    ISO639_3: 'heb',
    ISO639_1: 'he',
    localized_label: 'עברית',
    translationAvailable: false,
  },
  {
    label: 'Herero',
    key: 'hz',
    ISO639_3: 'her',
    ISO639_1: 'hz',
    localized_label: 'Herero',
    translationAvailable: false,
  },
  {
    label: 'Hindi',
    key: 'hi',
    ISO639_3: 'hin',
    elastic: 'hindi',
    ISO639_1: 'hi',
    localized_label: 'हिन्दी',
    translationAvailable: false,
  },
  {
    label: 'Hiri Motu',
    key: 'ho',
    ISO639_3: 'hmo',
    ISO639_1: 'ho',
    localized_label: 'Hiri Motu',
    translationAvailable: false,
  },
  {
    label: 'Hungarian',
    key: 'hu',
    ISO639_3: 'hun',
    elastic: 'hungarian',
    ISO639_1: 'hu',
    localized_label: 'Magyar',
    translationAvailable: false,
  },
  {
    label: 'Icelandic',
    key: 'is',
    ISO639_3: 'isl',
    ISO639_1: 'is',
    localized_label: 'Íslenska',
    translationAvailable: false,
  },
  {
    label: 'Ido',
    key: 'io',
    ISO639_3: 'ido',
    ISO639_1: 'io',
    localized_label: 'Ido',
    translationAvailable: false,
  },
  {
    label: 'Igbo',
    key: 'ig',
    ISO639_3: 'ibo',
    ISO639_1: 'ig',
    localized_label: 'Igbo',
    translationAvailable: false,
  },
  {
    label: 'Indonesian',
    key: 'in',
    ISO639_3: 'ind',
    elastic: 'indonesian',
    ISO639_1: 'in',
    localized_label: 'Indonesia',
    translationAvailable: false,
  },
  {
    label: 'Interlingua',
    key: 'ia',
    ISO639_3: 'ina',
    ISO639_1: 'ia',
    localized_label: 'Interlingua',
    translationAvailable: false,
  },
  {
    label: 'Interlingue',
    key: 'ie',
    ISO639_3: 'ile',
    ISO639_1: 'ie',
    localized_label: 'Interlingue',
    translationAvailable: false,
  },
  {
    label: 'Inuktitut',
    key: 'iu',
    ISO639_3: 'iku',
    ISO639_1: 'iu',
    localized_label: 'Inuktitut',
    translationAvailable: false,
  },
  {
    label: 'Inupiak',
    key: 'ik',
    ISO639_3: 'ipk',
    ISO639_1: 'ik',
    localized_label: 'Inupiaq',
    translationAvailable: false,
  },
  {
    label: 'Irish',
    key: 'ga',
    ISO639_3: 'gle',
    elastic: 'irish',
    ISO639_1: 'ga',
    localized_label: 'Gaeilge',
    translationAvailable: false,
  },
  {
    label: 'Italian',
    key: 'it',
    ISO639_3: 'ita',
    elastic: 'italian',
    ISO639_1: 'it',
    localized_label: 'Italiano',
    translationAvailable: false,
  },
  {
    label: 'Japanese',
    key: 'ja',
    ISO639_3: 'jpn',
    elastic: 'cjk',
    ISO639_1: 'ja',
    localized_label: '日本語',
    translationAvailable: false,
  },
  {
    label: 'Javanese',
    key: 'jv',
    ISO639_3: 'jav',
    ISO639_1: 'jv',
    localized_label: 'Jawa',
    translationAvailable: false,
  },
  {
    label: 'Kalaallisut, Greenlandic',
    key: 'kl',
    ISO639_3: 'kal',
    ISO639_1: 'kl',
    localized_label: 'Kalaallisut',
    translationAvailable: false,
  },
  {
    label: 'Kannada',
    key: 'kn',
    ISO639_3: 'kan',
    ISO639_1: 'kn',
    localized_label: 'ಕನ್ನಡ',
    translationAvailable: false,
  },
  {
    label: 'Kanuri',
    key: 'kr',
    ISO639_3: 'kau',
    ISO639_1: 'kr',
    localized_label: 'Kanuri',
    translationAvailable: false,
  },
  {
    label: 'Kashmiri',
    key: 'ks',
    rtl: true,
    ISO639_3: 'kas',
    ISO639_1: 'ks',
    localized_label: 'کٲشُر',
    translationAvailable: false,
  },
  {
    label: 'Kazakh',
    key: 'kk',
    ISO639_3: 'kaz',
    ISO639_1: 'kk',
    localized_label: 'Қазақ тілі',
    translationAvailable: false,
  },
  {
    label: 'Khmer',
    key: 'km',
    ISO639_3: 'khm',
    ISO639_1: 'km',
    localized_label: 'ខ្មែរ',
    translationAvailable: false,
  },
  {
    label: 'Kikuyu',
    key: 'ki',
    ISO639_3: 'kik',
    ISO639_1: 'ki',
    localized_label: 'Gikuyu',
    translationAvailable: false,
  },
  {
    label: 'Kinyarwanda (Rwanda)',
    key: 'rw',
    ISO639_3: 'kin',
    ISO639_1: 'rw',
    localized_label: 'Kinyarwanda',
    translationAvailable: false,
  },
  {
    label: 'Kirundi',
    key: 'rn',
    ISO639_3: 'run',
    ISO639_1: 'rn',
    localized_label: 'Ikirundi',
    translationAvailable: false,
  },
  {
    label: 'Kyrgyz',
    key: 'ky',
    ISO639_3: 'kir',
    ISO639_1: 'ky',
    localized_label: 'Кыргызча',
    translationAvailable: false,
  },
  {
    label: 'Komi',
    key: 'kv',
    ISO639_3: 'kom',
    ISO639_1: 'kv',
    localized_label: 'Komi',
    translationAvailable: false,
  },
  {
    label: 'Kongo',
    key: 'kg',
    ISO639_3: 'kon',
    ISO639_1: 'kg',
    localized_label: 'Kongo',
    translationAvailable: false,
  },
  {
    label: 'Korean',
    key: 'ko',
    ISO639_3: 'kor',
    elastic: 'cjk',
    ISO639_1: 'ko',
    localized_label: '한국어',
    translationAvailable: false,
  },
  {
    label: 'Kurdish',
    key: 'ku',
    rtl: true,
    ISO639_3: 'kur',
    elastic: 'sorani',
    ISO639_1: 'ku',
    localized_label: 'Kurdî',
    translationAvailable: false,
  },
  {
    label: 'Kwanyama',
    key: 'kj',
    ISO639_3: 'kua',
    ISO639_1: 'kj',
    localized_label: 'Kuanyama',
    translationAvailable: false,
  },
  {
    label: 'Lao',
    key: 'lo',
    ISO639_3: 'lao',
    ISO639_1: 'lo',
    localized_label: 'ລາວ',
    translationAvailable: false,
  },
  {
    label: 'Latin',
    key: 'la',
    ISO639_3: 'lat',
    ISO639_1: 'la',
    localized_label: 'Latin',
    translationAvailable: false,
  },
  {
    label: 'Latvian (Lettish)',
    key: 'lv',
    ISO639_3: 'lav',
    elastic: 'latvian',
    ISO639_1: 'lv',
    localized_label: 'Latviešu',
    translationAvailable: false,
  },
  {
    label: 'Limburgish (Limburger)',
    key: 'li',
    ISO639_3: 'lim',
    ISO639_1: 'li',
    localized_label: 'Limburgish',
    translationAvailable: false,
  },
  {
    label: 'Lingala',
    key: 'ln',
    ISO639_3: 'lin',
    ISO639_1: 'ln',
    localized_label: 'Lingála',
    translationAvailable: false,
  },
  {
    label: 'Lithuanian',
    key: 'lt',
    ISO639_3: 'lit',
    elastic: 'lithuanian',
    ISO639_1: 'lt',
    localized_label: 'Lietuvių',
    translationAvailable: false,
  },
  {
    label: 'Luga-Katanga',
    key: 'lu',
    ISO639_3: 'lub',
    ISO639_1: 'lu',
    localized_label: 'Tshiluba',
    translationAvailable: false,
  },
  {
    label: 'Luganda, Ganda',
    key: 'lg',
    ISO639_3: 'lug',
    ISO639_1: 'lg',
    localized_label: 'Luganda',
    translationAvailable: false,
  },
  {
    label: 'Luxembourgish',
    key: 'lb',
    ISO639_3: 'ltz',
    ISO639_1: 'lb',
    localized_label: 'Lëtzebuergesch',
    translationAvailable: false,
  },
  {
    label: 'Macedonian',
    key: 'mk',
    ISO639_3: 'mkd',
    ISO639_1: 'mk',
    localized_label: 'Македонски',
    translationAvailable: false,
  },
  {
    label: 'Malagasy',
    key: 'mg',
    ISO639_3: 'mlg',
    ISO639_1: 'mg',
    localized_label: 'Malagasy',
    translationAvailable: false,
  },
  {
    label: 'Malay',
    key: 'ms',
    ISO639_3: 'msa',
    ISO639_1: 'ms',
    localized_label: 'Melayu',
    translationAvailable: false,
  },
  {
    label: 'Malayalam',
    key: 'ml',
    ISO639_3: 'mal',
    ISO639_1: 'ml',
    localized_label: 'മലയാളം',
    translationAvailable: false,
  },
  {
    label: 'Maltese',
    key: 'mt',
    ISO639_3: 'mlt',
    ISO639_1: 'mt',
    localized_label: 'Malti',
    translationAvailable: false,
  },
  {
    label: 'Maori',
    key: 'mi',
    ISO639_3: 'mri',
    ISO639_1: 'mi',
    localized_label: 'Te reo Māori',
    translationAvailable: false,
  },
  {
    label: 'Marathi',
    key: 'mr',
    ISO639_3: 'mar',
    ISO639_1: 'mr',
    localized_label: 'मराठी',
    translationAvailable: false,
  },
  {
    label: 'Marshallese',
    key: 'mh',
    ISO639_3: 'mah',
    ISO639_1: 'mh',
    localized_label: 'Marshallese',
    translationAvailable: false,
  },
  {
    label: 'Mongolian',
    key: 'mn',
    ISO639_3: 'mon',
    ISO639_1: 'mn',
    localized_label: 'Монгол',
    translationAvailable: false,
  },
  {
    label: 'Nauru',
    key: 'na',
    ISO639_3: 'nau',
    ISO639_1: 'na',
    localized_label: 'Nauru',
    translationAvailable: false,
  },
  {
    label: 'Navajo',
    key: 'nv',
    ISO639_3: 'nav',
    ISO639_1: 'nv',
    localized_label: 'Navajo',
    translationAvailable: false,
  },
  {
    label: 'Ndonga',
    key: 'ng',
    ISO639_3: 'ndo',
    ISO639_1: 'ng',
    localized_label: 'Ndonga',
    translationAvailable: false,
  },
  {
    label: 'Northern Ndebele',
    key: 'nd',
    ISO639_3: 'nde',
    ISO639_1: 'nd',
    localized_label: 'IsiNdebele',
    translationAvailable: false,
  },
  {
    label: 'Nepali',
    key: 'ne',
    ISO639_3: 'nep',
    ISO639_1: 'ne',
    localized_label: 'नेपाली',
    translationAvailable: false,
  },
  {
    label: 'Norwegian',
    key: 'no',
    ISO639_3: 'nor',
    ISO639_1: 'no',
    localized_label: 'Norsk',
    translationAvailable: false,
  },
  {
    label: 'Norwegian bokmål',
    key: 'nb',
    ISO639_3: 'nob',
    elastic: 'norwegian',
    ISO639_1: 'nb',
    localized_label: 'Norsk bokmål',
    translationAvailable: false,
  },
  {
    label: 'Norwegian nynorsk',
    key: 'nn',
    ISO639_3: 'nno',
    elastic: 'norwegian',
    ISO639_1: 'nn',
    localized_label: 'Norsk nynorsk',
    translationAvailable: false,
  },
  {
    label: 'Occitan',
    key: 'oc',
    ISO639_3: 'oci',
    ISO639_1: 'oc',
    localized_label: 'Occitan',
    translationAvailable: false,
  },
  {
    label: 'Ojibwe',
    key: 'oj',
    ISO639_3: 'oji',
    ISO639_1: 'oj',
    localized_label: 'Ojibwa',
    translationAvailable: false,
  },
  {
    label: 'Old Church Slavonic, Old Bulgarian',
    key: 'cu',
    ISO639_3: 'chu',
    ISO639_1: 'cu',
    localized_label: 'Church Slavic',
    translationAvailable: false,
  },
  {
    label: 'Oriya',
    key: 'or',
    ISO639_3: 'ori',
    ISO639_1: 'or',
    localized_label: 'ଓଡ଼ିଆ',
    translationAvailable: false,
  },
  {
    label: 'Oromo (Afaan Oromo)',
    key: 'om',
    ISO639_3: 'orm',
    ISO639_1: 'om',
    localized_label: 'Oromoo',
    translationAvailable: false,
  },
  {
    label: 'Ossetian',
    key: 'os',
    ISO639_3: 'oss',
    ISO639_1: 'os',
    localized_label: 'Ирон',
    translationAvailable: false,
  },
  {
    label: 'Pāli',
    key: 'pi',
    ISO639_3: 'pli',
    ISO639_1: 'pi',
    localized_label: 'Pali',
    translationAvailable: false,
  },
  {
    label: 'Pashto, Pushto',
    key: 'ps',
    rtl: true,
    ISO639_3: 'pus',
    ISO639_1: 'ps',
    localized_label: 'پښتو',
    translationAvailable: false,
  },
  {
    label: 'Persian (Farsi)',
    key: 'fa',
    rtl: true,
    ISO639_3: 'fas',
    elastic: 'persian',
    ISO639_1: 'fa',
    localized_label: 'فارسی',
    translationAvailable: false,
  },
  {
    label: 'Polish',
    key: 'pl',
    ISO639_3: 'pol',
    ISO639_1: 'pl',
    localized_label: 'Polski',
    translationAvailable: false,
  },
  {
    label: 'Portuguese',
    key: 'pt',
    ISO639_3: 'por',
    elastic: 'portuguese',
    ISO639_1: 'pt',
    localized_label: 'Português',
    translationAvailable: false,
  },
  {
    label: 'Punjabi (Eastern)',
    key: 'pa',
    ISO639_3: 'pan',
    ISO639_1: 'pa',
    localized_label: 'ਪੰਜਾਬੀ',
    translationAvailable: false,
  },
  {
    label: 'Quechua',
    key: 'qu',
    ISO639_3: 'que',
    ISO639_1: 'qu',
    localized_label: 'Runasimi',
    translationAvailable: false,
  },
  {
    label: 'Romansh',
    key: 'rm',
    ISO639_3: 'roh',
    ISO639_1: 'rm',
    localized_label: 'Rumantsch',
    translationAvailable: false,
  },
  {
    label: 'Romanian/Moldavian',
    key: 'ro',
    ISO639_3: 'ron',
    elastic: 'romanian',
    ISO639_1: 'ro',
    localized_label: 'Română',
    translationAvailable: false,
  },
  {
    label: 'Russian',
    key: 'ru',
    ISO639_3: 'rus',
    elastic: 'russian',
    ISO639_1: 'ru',
    localized_label: 'Русский',
    translationAvailable: false,
  },
  {
    label: 'Sami',
    key: 'se',
    ISO639_3: 'sme',
    ISO639_1: 'se',
    localized_label: 'Davvisámegiella',
    translationAvailable: false,
  },
  {
    label: 'Samoan',
    key: 'sm',
    ISO639_3: 'smo',
    ISO639_1: 'sm',
    localized_label: 'Samoan',
    translationAvailable: false,
  },
  {
    label: 'Sango',
    key: 'sg',
    ISO639_3: 'sag',
    ISO639_1: 'sg',
    localized_label: 'Sängö',
    translationAvailable: false,
  },
  {
    label: 'Sanskrit',
    key: 'sa',
    ISO639_3: 'san',
    ISO639_1: 'sa',
    localized_label: 'संस्कृत भाषा',
    translationAvailable: false,
  },
  {
    label: 'Serbian',
    key: 'sr',
    ISO639_3: 'srp',
    ISO639_1: 'sr',
    localized_label: 'Српски',
    translationAvailable: false,
  },
  {
    label: 'Serbo-Croatian',
    key: 'sh',
    ISO639_3: 'hbs',
    ISO639_1: 'sh',
    localized_label: 'Srpski (latinica)',
    translationAvailable: false,
  },
  {
    label: 'Sesotho',
    key: 'st',
    ISO639_3: 'sot',
    ISO639_1: 'st',
    localized_label: 'Southern Sotho',
    translationAvailable: false,
  },
  {
    label: 'Setswana',
    key: 'tn',
    ISO639_3: 'tsn',
    ISO639_1: 'tn',
    localized_label: 'Tswana',
    translationAvailable: false,
  },
  {
    label: 'Shona',
    key: 'sn',
    ISO639_3: 'sna',
    ISO639_1: 'sn',
    localized_label: 'ChiShona',
    translationAvailable: false,
  },
  {
    label: 'Sichuan Yi, Nuosu',
    key: 'ii',
    ISO639_3: 'iii',
    ISO639_1: 'ii',
    localized_label: 'ꆈꌠꉙ',
    translationAvailable: false,
  },
  {
    label: 'Sindhi',
    key: 'sd',
    ISO639_3: 'snd',
    ISO639_1: 'sd',
    localized_label: 'سنڌي',
    translationAvailable: false,
  },
  {
    label: 'Sinhalese',
    key: 'si',
    ISO639_3: 'sin',
    ISO639_1: 'si',
    localized_label: 'සිංහල',
    translationAvailable: false,
  },
  {
    label: 'Siswati, Swati',
    key: 'ss',
    ISO639_3: 'ssw',
    ISO639_1: 'ss',
    localized_label: 'Swati',
    translationAvailable: false,
  },
  {
    label: 'Slovak',
    key: 'sk',
    ISO639_3: 'slk',
    ISO639_1: 'sk',
    localized_label: 'Slovenčina',
    translationAvailable: false,
  },
  {
    label: 'Slovenian',
    key: 'sl',
    ISO639_3: 'slv',
    ISO639_1: 'sl',
    localized_label: 'Slovenščina',
    translationAvailable: false,
  },
  {
    label: 'Somali',
    key: 'so',
    ISO639_3: 'som',
    ISO639_1: 'so',
    localized_label: 'Soomaali',
    translationAvailable: false,
  },
  {
    label: 'Southern Ndebele',
    key: 'nr',
    ISO639_3: 'nbl',
    ISO639_1: 'nr',
    localized_label: 'South Ndebele',
    translationAvailable: false,
  },
  {
    label: 'Spanish',
    key: 'es',
    ISO639_3: 'spa',
    elastic: 'spanish',
    ISO639_1: 'es',
    localized_label: 'Español',
    translationAvailable: false,
  },
  {
    label: 'Sundanese',
    key: 'su',
    ISO639_3: 'sun',
    ISO639_1: 'su',
    localized_label: 'Basa Sunda',
    translationAvailable: false,
  },
  {
    label: 'Swahili (Kiswahili)',
    key: 'sw',
    ISO639_3: 'swa',
    ISO639_1: 'sw',
    localized_label: 'Kiswahili',
    translationAvailable: false,
  },
  {
    label: 'Swedish',
    key: 'sv',
    ISO639_3: 'swe',
    elastic: 'swedish',
    ISO639_1: 'sv',
    localized_label: 'Svenska',
    translationAvailable: false,
  },
  {
    label: 'Tagalog',
    key: 'tl',
    ISO639_3: 'tgl',
    ISO639_1: 'tl',
    localized_label: 'Filipino',
    translationAvailable: false,
  },
  {
    label: 'Tahitian',
    key: 'ty',
    ISO639_3: 'tah',
    ISO639_1: 'ty',
    localized_label: 'Tahitian',
    translationAvailable: false,
  },
  {
    label: 'Tajik',
    key: 'tg',
    ISO639_3: 'tgk',
    ISO639_1: 'tg',
    localized_label: 'Тоҷикӣ',
    translationAvailable: false,
  },
  {
    label: 'Tamil',
    key: 'ta',
    ISO639_3: 'tam',
    ISO639_1: 'ta',
    localized_label: 'தமிழ்',
    translationAvailable: false,
  },
  {
    label: 'Tatar',
    key: 'tt',
    ISO639_3: 'tat',
    ISO639_1: 'tt',
    localized_label: 'Татар',
    translationAvailable: false,
  },
  {
    label: 'Telugu',
    key: 'te',
    ISO639_3: 'tel',
    ISO639_1: 'te',
    localized_label: 'తెలుగు',
    translationAvailable: false,
  },
  {
    label: 'Thai',
    key: 'th',
    ISO639_3: 'tha',
    elastic: 'thai',
    ISO639_1: 'th',
    localized_label: 'ไทย',
    translationAvailable: false,
  },
  {
    label: 'Tibetan',
    key: 'bo',
    ISO639_3: 'bod',
    ISO639_1: 'bo',
    localized_label: 'བོད་སྐད་',
    translationAvailable: false,
  },
  {
    label: 'Tigrinya',
    key: 'ti',
    ISO639_3: 'tir',
    ISO639_1: 'ti',
    localized_label: 'ትግርኛ',
    translationAvailable: false,
  },
  {
    label: 'Tonga',
    key: 'to',
    ISO639_3: 'ton',
    ISO639_1: 'to',
    localized_label: 'Lea fakatonga',
    translationAvailable: false,
  },
  {
    label: 'Tsonga',
    key: 'ts',
    ISO639_3: 'tso',
    ISO639_1: 'ts',
    localized_label: 'Tsonga',
    translationAvailable: false,
  },
  {
    label: 'Turkish',
    key: 'tr',
    ISO639_3: 'tur',
    elastic: 'turkish',
    ISO639_1: 'tr',
    localized_label: 'Türkçe',
    translationAvailable: false,
  },
  {
    label: 'Turkmen',
    key: 'tk',
    ISO639_3: 'tuk',
    ISO639_1: 'tk',
    localized_label: 'Türkmen dili',
    translationAvailable: false,
  },
  {
    label: 'Twi',
    key: 'tw',
    ISO639_3: 'twi',
    ISO639_1: 'tw',
    localized_label: 'Akan',
    translationAvailable: false,
  },
  {
    label: 'Uyghur',
    key: 'ug',
    ISO639_3: 'uig',
    ISO639_1: 'ug',
    localized_label: 'ئۇيغۇرچە',
    translationAvailable: false,
  },
  {
    label: 'Ukrainian',
    key: 'uk',
    ISO639_3: 'ukr',
    ISO639_1: 'uk',
    localized_label: 'Українська',
    translationAvailable: false,
  },
  {
    label: 'Urdu',
    key: 'ur',
    rtl: true,
    ISO639_3: 'urd',
    ISO639_1: 'ur',
    localized_label: 'اردو',
    translationAvailable: false,
  },
  {
    label: 'Uzbek',
    key: 'uz',
    ISO639_3: 'uzb',
    ISO639_1: 'uz',
    localized_label: 'O‘zbek',
    translationAvailable: false,
  },
  {
    label: 'Venda',
    key: 've',
    ISO639_3: 'ven',
    ISO639_1: 've',
    localized_label: 'Venda',
    translationAvailable: false,
  },
  {
    label: 'Vietnamese',
    key: 'vi',
    ISO639_3: 'vie',
    ISO639_1: 'vi',
    localized_label: 'Tiếng Việt',
    translationAvailable: false,
  },
  {
    label: 'Volapük',
    key: 'vo',
    ISO639_3: 'vol',
    ISO639_1: 'vo',
    localized_label: 'Volapük',
    translationAvailable: false,
  },
  {
    label: 'Wallon',
    key: 'wa',
    ISO639_3: 'wln',
    ISO639_1: 'wa',
    localized_label: 'Walloon',
    translationAvailable: false,
  },
  {
    label: 'Welsh',
    key: 'cy',
    ISO639_3: 'cym',
    ISO639_1: 'cy',
    localized_label: 'Cymraeg',
    translationAvailable: false,
  },
  {
    label: 'Wolof',
    key: 'wo',
    ISO639_3: 'wol',
    ISO639_1: 'wo',
    localized_label: 'Wolof',
    translationAvailable: false,
  },
  {
    label: 'Western Frisian',
    key: 'fy',
    ISO639_3: 'fry',
    ISO639_1: 'fy',
    localized_label: 'Frysk',
    translationAvailable: false,
  },
  {
    label: 'Xhosa',
    key: 'xh',
    ISO639_3: 'xho',
    ISO639_1: 'xh',
    localized_label: 'IsiXhosa',
    translationAvailable: false,
  },
  {
    label: 'Yiddish',
    key: 'yi',
    rtl: true,
    ISO639_3: 'yid',
    ISO639_1: 'yi',
    localized_label: 'ייִדיש',
    translationAvailable: false,
  },
  {
    label: 'Yoruba',
    key: 'yo',
    ISO639_3: 'yor',
    ISO639_1: 'yo',
    localized_label: 'Èdè Yorùbá',
    translationAvailable: false,
  },
  {
    label: 'Zhuang, Chuang',
    key: 'za',
    ISO639_3: 'zha',
    ISO639_1: 'za',
    localized_label: 'Zhuang',
    translationAvailable: false,
  },
  {
    label: 'Zulu',
    key: 'zu',
    ISO639_3: 'zul',
    ISO639_1: 'zu',
    localized_label: 'IsiZulu',
    translationAvailable: false,
  },
];

export type { LanguageCode };

export { otherLanguageSchema, availableLanguages };
