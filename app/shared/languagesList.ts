import { LanguageSchema } from 'shared/types/commonTypes';

const elasticLanguages: {
  [index: string]: { franc: string; elastic: string; ISO639_1: string | null };
} = {
  arb: { franc: 'arb', elastic: 'arabic', ISO639_1: 'ar' },
  bul: { franc: 'bul', elastic: 'bulgarian', ISO639_1: 'bg' },
  cat: { franc: 'cat', elastic: 'catalan', ISO639_1: 'ca' },
  cjk: { franc: 'cjk', elastic: 'cjk', ISO639_1: null },
  ckb: { franc: 'ckb', elastic: 'sorani', ISO639_1: null },
  ces: { franc: 'ces', elastic: 'czech', ISO639_1: 'cs' },
  dan: { franc: 'dan', elastic: 'danish', ISO639_1: 'da' },
  deu: { franc: 'deu', elastic: 'german', ISO639_1: 'de' },
  ell: { franc: 'ell', elastic: 'greek', ISO639_1: 'el' },
  eng: { franc: 'eng', elastic: 'english', ISO639_1: 'en' },
  eus: { franc: 'eus', elastic: 'basque', ISO639_1: 'eu' },
  fas: { franc: 'fas', elastic: 'persian', ISO639_1: 'fa' },
  fin: { franc: 'fin', elastic: 'finnish', ISO639_1: 'fi' },
  fra: { franc: 'fra', elastic: 'french', ISO639_1: 'fr' },
  gle: { franc: 'gle', elastic: 'irish', ISO639_1: 'ga' },
  glg: { franc: 'glg', elastic: 'galician', ISO639_1: 'gl' },
  hin: { franc: 'hin', elastic: 'hindi', ISO639_1: 'hi' },
  hun: { franc: 'hun', elastic: 'hungarian', ISO639_1: 'hu' },
  hye: { franc: 'hye', elastic: 'armenian', ISO639_1: 'hy' },
  ind: { franc: 'ind', elastic: 'indonesian', ISO639_1: 'id' },
  ita: { franc: 'ita', elastic: 'italian', ISO639_1: 'it' },
  lav: { franc: 'lav', elastic: 'latvian', ISO639_1: 'lv' },
  lit: { franc: 'lit', elastic: 'lithuanian', ISO639_1: 'lt' },
  nld: { franc: 'nld', elastic: 'dutch', ISO639_1: 'nl' },
  nno: { franc: 'nno', elastic: 'norwegian', ISO639_1: 'nn' },
  nob: { franc: 'nob', elastic: 'norwegian', ISO639_1: 'nb' },
  por: { franc: 'por', elastic: 'portuguese', ISO639_1: 'pt' },
  ron: { franc: 'ron', elastic: 'romanian', ISO639_1: 'ro' },
  rus: { franc: 'rus', elastic: 'russian', ISO639_1: 'ru' },
  spa: { franc: 'spa', elastic: 'spanish', ISO639_1: 'es' },
  swe: { franc: 'swe', elastic: 'swedish', ISO639_1: 'sv' },
  tha: { franc: 'tha', elastic: 'thai', ISO639_1: 'th' },
  tur: { franc: 'tur', elastic: 'turkish', ISO639_1: 'tr' },
};

const allLanguages: LanguageSchema[] = [
  { label: 'Abkhazian', key: 'ab', ISO639_3: 'abk' },
  { label: 'Afar', key: 'aa', ISO639_3: 'aar' },
  { label: 'Afrikaans', key: 'af', ISO639_3: 'afr' },
  { label: 'Akan', key: 'ak', ISO639_3: 'aka' },
  { label: 'Albanian', key: 'sq', ISO639_3: 'sqi' },
  { label: 'Amharic', key: 'am', ISO639_3: 'amh' },
  { label: 'Arabic', key: 'ar', rtl: true, ISO639_3: 'ara' },
  { label: 'Aragonese', key: 'an', ISO639_3: 'arg' },
  { label: 'Armenian', key: 'hy', ISO639_3: 'hye' },
  { label: 'Assamese', key: 'as', ISO639_3: 'asm' },
  { label: 'Avaric', key: 'av', ISO639_3: 'ava' },
  { label: 'Avestan', key: 'ae', ISO639_3: 'ave' },
  { label: 'Aymara', key: 'ay', ISO639_3: 'aym' },
  { label: 'Azerbaijani', key: 'az', ISO639_3: 'aze' },
  { label: 'Bambara', key: 'bm', ISO639_3: 'bam' },
  { label: 'Bashkir', key: 'ba', ISO639_3: 'bak' },
  { label: 'Basque', key: 'eu', ISO639_3: 'eus' },
  { label: 'Belarusian', key: 'be', ISO639_3: 'bel' },
  { label: 'Bengali (Bangla)', key: 'bn', ISO639_3: 'ben'},
  { label: 'Bihari', key: 'bh', ISO639_3: 'bih' },
  { label: 'Bislama', key: 'bi', ISO639_3: 'bis' },
  { label: 'Bosnian', key: 'bs', ISO639_3: 'bos' },
  { label: 'Breton', key: 'br', ISO639_3: 'bre' },
  { label: 'Bulgarian', key: 'bg', ISO639_3: 'bul' },
  { label: 'Burmese', key: 'my', ISO639_3: 'mya' },
  { label: 'Catalan', key: 'ca', ISO639_3: 'cat' },
  { label: 'Chamorro', key: 'ch', ISO639_3: 'cha' },
  { label: 'Chechen', key: 'ce', ISO639_3: 'che' },
  { label: 'Chichewa, Chewa, Nyanja', key: 'ny', ISO639_3: 'nya' },
  { label: 'Chinese', key: 'zh', ISO639_3: 'zho' },
  { label: 'Chinese (Simplified)', key: 'zh-Hans' },
  { label: 'Chinese (Traditional)', key: 'zh-Hant' },
  { label: 'Chuvash', key: 'cv', ISO639_3: 'chv' },
  { label: 'Cornish', key: 'kw', ISO639_3: 'cor' },
  { label: 'Corsican', key: 'co', ISO639_3: 'cos' },
  { label: 'Cree', key: 'cr', ISO639_3: 'cre' },
  { label: 'Croatian', key: 'hr', ISO639_3: 'hrv' },
  { label: 'Czech', key: 'cs', ISO639_3: 'ces' },
  { label: 'Danish', key: 'da', ISO639_3: 'dan' },
  { label: 'Divehi, Dhivehi, Maldivian', key: 'dv', rtl: true, ISO639_3: 'div' },
  { label: 'Dutch', key: 'nl', ISO639_3: 'nld' },
  { label: 'Dzongkha', key: 'dz', ISO639_3: 'dzo' },
  { label: 'English', key: 'en', ISO639_3: 'eng' },
  { label: 'Esperanto', key: 'eo', ISO639_3: 'epo' },
  { label: 'Estonian', key: 'et', ISO639_3: 'est' },
  { label: 'Ewe', key: 'ee', ISO639_3: 'ewe' },
  { label: 'Faroese', key: 'fo', ISO639_3: 'fao' },
  { label: 'Fijian', key: 'fj', ISO639_3: 'fij' },
  { label: 'Finnish', key: 'fi', ISO639_3: 'fin' },
  { label: 'French', key: 'fr', ISO639_3: 'fra' },
  { label: 'Fula, Fulah, Pulaar, Pular', key: 'ff' },
  { label: 'Galician', key: 'gl', ISO639_3: 'glg' },
  { label: 'Gaelic Scottish', key: 'gd', ISO639_3: 'glg' },
  { label: 'Gaelic (Manx)', key: 'gv', ISO639_3: 'glv' },
  { label: 'Georgian', key: 'ka', ISO639_3: 'kat' },
  { label: 'German', key: 'de', ISO639_3: 'deu' },
  { label: 'Greek', key: 'el', ISO639_3: 'ell' },
  { label: 'Guarani', key: 'gn', ISO639_3: 'grn' },
  { label: 'Gujarati', key: 'gu', ISO639_3: 'guj' },
  { label: 'Haitian Creole', key: 'ht', ISO639_3: 'hat' },
  { label: 'Hausa', key: 'ha', rtl: true, ISO639_3: 'hau' },
  { label: 'Hebrew', key: 'he', rtl: true, ISO639_3: 'heb' },
  { label: 'Herero', key: 'hz', ISO639_3: 'her' },
  { label: 'Hindi', key: 'hi', ISO639_3: 'hin' },
  { label: 'Hiri Motu', key: 'ho', ISO639_3: 'hmo' },
  { label: 'Hungarian', key: 'hu', ISO639_3: 'hun' },
  { label: 'Icelandic', key: 'is', ISO639_3: 'isl' },
  { label: 'Ido', key: 'io', ISO639_3: 'ido' },
  { label: 'Igbo', key: 'ig', ISO639_3: 'ibo' },
  { label: 'Indonesian', key: 'in', ISO639_3: 'ind' },
  { label: 'Interlingua', key: 'ia', ISO639_3: 'ina' },
  { label: 'Interlingue', key: 'ie', ISO639_3: 'ile' },
  { label: 'Inuktitut', key: 'iu', ISO639_3: 'iku' },
  { label: 'Inupiak', key: 'ik', ISO639_3: 'ipk' },
  { label: 'Irish', key: 'ga', ISO639_3: 'gle' },
  { label: 'Italian', key: 'it', ISO639_3: 'ita' },
  { label: 'Japanese', key: 'ja', ISO639_3: 'jpn' },
  { label: 'Javanese', key: 'jv', ISO639_3: 'jav' },
  { label: 'Kalaallisut, Greenlandic', key: 'kl', ISO639_3: 'kal' },
  { label: 'Kannada', key: 'kn', ISO639_3: 'kan' },
  { label: 'Kanuri', key: 'kr', ISO639_3: 'kau' },
  { label: 'Kashmiri', key: 'ks', rtl: true, ISO639_3: 'kas' },
  { label: 'Kazakh', key: 'kk', ISO639_3: 'kaz' },
  { label: 'Khmer', key: 'km', ISO639_3: 'khm' },
  { label: 'Kikuyu', key: 'ki', ISO639_3: 'kik' },
  { label: 'Kinyarwanda (Rwanda)', key: 'rw', ISO639_3: 'kin' },
  { label: 'Kirundi', key: 'rn', ISO639_3: 'run' },
  { label: 'Kyrgyz', key: 'ky', ISO639_3: 'kir' },
  { label: 'Komi', key: 'kv', ISO639_3: 'kom' },
  { label: 'Kongo', key: 'kg', ISO639_3: 'kon' },
  { label: 'Korean', key: 'ko', ISO639_3: 'kor' },
  { label: 'Kurdish', key: 'ku', rtl: true, ISO639_3: 'kur' },
  { label: 'Kwanyama', key: 'kj', ISO639_3: 'kua' },
  { label: 'Lao', key: 'lo', ISO639_3: 'lao' },
  { label: 'Latin', key: 'la', ISO639_3: 'lat' },
  { label: 'Latvian (Lettish)', key: 'lv', ISO639_3: 'lav' },
  { label: 'Limburgish (Limburger)', key: 'li', ISO639_3: 'lim' },
  { label: 'Lingala', key: 'ln', ISO639_3: 'lin' },
  { label: 'Lithuanian', key: 'lt', ISO639_3: 'lit' },
  { label: 'Luga-Katanga', key: 'lu', ISO639_3: 'lub' },
  { label: 'Luganda, Ganda', key: 'lg', ISO639_3: 'lug' },
  { label: 'Luxembourgish', key: 'lb', ISO639_3: 'ltz' },
  { label: 'Macedonian', key: 'mk', ISO639_3: 'mkd' },
  { label: 'Malagasy', key: 'mg', ISO639_3: 'mlg' },
  { label: 'Malay', key: 'ms', ISO639_3: 'msa' },
  { label: 'Malayalam', key: 'ml', ISO639_3: 'mal' },
  { label: 'Maltese', key: 'mt', ISO639_3: 'mlt' },
  { label: 'Maori', key: 'mi', ISO639_3: 'mri' },
  { label: 'Marathi', key: 'mr', ISO639_3: 'mar' },
  { label: 'Marshallese', key: 'mh', ISO639_3: 'mah' },
  { label: 'Moldavian', key: 'mo', ISO639_3: 'ron' },
  { label: 'Mongolian', key: 'mn', ISO639_3: 'mon' },
  { label: 'Nauru', key: 'na', ISO639_3: 'nau' },
  { label: 'Navajo', key: 'nv', ISO639_3: 'nav' },
  { label: 'Ndonga', key: 'ng', ISO639_3: 'ndo' },
  { label: 'Northern Ndebele', key: 'nd', ISO639_3: 'nde' },
  { label: 'Nepali', key: 'ne', ISO639_3: 'nep' },
  { label: 'Norwegian', key: 'no', ISO639_3: 'nor' },
  { label: 'Norwegian bokmål', key: 'nb', ISO639_3: 'nob' },
  { label: 'Norwegian nynorsk', key: 'nn', ISO639_3: 'nno' },
  { label: 'Occitan', key: 'oc', ISO639_3: 'oci' },
  { label: 'Ojibwe', key: 'oj', ISO639_3: 'oji' },
  { label: 'Old Church Slavonic, Old Bulgarian', key: 'cu', ISO639_3: 'chu' },
  { label: 'Oriya', key: 'or', ISO639_3: 'ori' },
  { label: 'Oromo (Afaan Oromo)', key: 'om', ISO639_3: 'orm' },
  { label: 'Ossetian', key: 'os', ISO639_3: 'oss' },
  { label: 'Pāli', key: 'pi', ISO639_3: 'pli' },
  { label: 'Pashto, Pushto', key: 'ps', rtl: true, ISO639_3: 'pus' },
  { label: 'Persian (Farsi)', key: 'fa', rtl: true, ISO639_3: 'fas' },
  { label: 'Polish', key: 'pl', ISO639_3: 'pol' },
  { label: 'Portuguese', key: 'pt', ISO639_3: 'por' },
  { label: 'Punjabi (Eastern)', key: 'pa', ISO639_3: 'pan' },
  { label: 'Quechua', key: 'qu', ISO639_3: 'que' },
  { label: 'Romansh', key: 'rm', ISO639_3: 'roh' },
  { label: 'Romanian', key: 'ro', ISO639_3: 'ron' },
  { label: 'Russian', key: 'ru', ISO639_3: 'rus' },
  { label: 'Sami', key: 'se', ISO639_3: 'sme' },
  { label: 'Samoan', key: 'sm', ISO639_3: 'smo' },
  { label: 'Sango', key: 'sg', ISO639_3: 'sag' },
  { label: 'Sanskrit', key: 'sa', ISO639_3: 'san' },
  { label: 'Serbian', key: 'sr', ISO639_3: 'srp' },
  { label: 'Serbo-Croatian', key: 'sh', ISO639_3: 'hbs' },
  { label: 'Sesotho', key: 'st', ISO639_3: 'sot' },
  { label: 'Setswana', key: 'tn', ISO639_3: 'sot' },
  { label: 'Shona', key: 'sn', ISO639_3: 'sna' },
  { label: 'Sichuan Yi, Nuosu', key: 'ii', ISO639_3: 'iii' },
  { label: 'Sindhi', key: 'sd', ISO639_3: 'snd' },
  { label: 'Sinhalese', key: 'si', ISO639_3: 'sin' },
  { label: 'Siswati, Swati', key: 'ss', ISO639_3: 'ssw' },
  { label: 'Slovak', key: 'sk', ISO639_3: 'slk' },
  { label: 'Slovenian', key: 'sl', ISO639_3: 'slv' },
  { label: 'Somali', key: 'so', ISO639_3: 'som' },
  { label: 'Southern Ndebele', key: 'nr', ISO639_3: 'nbl' },
  { label: 'Spanish', key: 'es', ISO639_3: 'spa' },
  { label: 'Sundanese', key: 'su', ISO639_3: 'sun' },
  { label: 'Swahili (Kiswahili)', key: 'sw', ISO639_3: 'swa' },
  { label: 'Swedish', key: 'sv', ISO639_3: 'swe' },
  { label: 'Tagalog', key: 'tl', ISO639_3: 'tgl' },
  { label: 'Tahitian', key: 'ty', ISO639_3: 'tah' },
  { label: 'Tajik', key: 'tg', ISO639_3: 'tgk' },
  { label: 'Tamil', key: 'ta', ISO639_3: 'tam' },
  { label: 'Tatar', key: 'tt', ISO639_3: 'tat' },
  { label: 'Telugu', key: 'te', ISO639_3: 'tel' },
  { label: 'Thai', key: 'th', ISO639_3: 'tha' },
  { label: 'Tibetan', key: 'bo', ISO639_3: 'bod' },
  { label: 'Tigrinya', key: 'ti', ISO639_3: 'tir' },
  { label: 'Tonga', key: 'to', ISO639_3: 'ton' },
  { label: 'Tsonga', key: 'ts', ISO639_3: 'tso' },
  { label: 'Turkish', key: 'tr', ISO639_3: 'tur' },
  { label: 'Turkmen', key: 'tk', ISO639_3: 'tuk' },
  { label: 'Twi', key: 'tw', ISO639_3: 'twi' },
  { label: 'Uyghur', key: 'ug', ISO639_3: 'uig' },
  { label: 'Ukrainian', key: 'uk', ISO639_3: 'ukr' },
  { label: 'Urdu', key: 'ur', rtl: true, ISO639_3: 'urd' },
  { label: 'Uzbek', key: 'uz', ISO639_3: 'uzb' },
  { label: 'Venda', key: 've', ISO639_3: 'ven' },
  { label: 'Vietnamese', key: 'vi', ISO639_3: 'vie' },
  { label: 'Volapük', key: 'vo', ISO639_3: 'vol' },
  { label: 'Wallon', key: 'wa', ISO639_3: 'wln' },
  { label: 'Welsh', key: 'cy', ISO639_3: 'cym' },
  { label: 'Wolof', key: 'wo', ISO639_3: 'wol' },
  { label: 'Western Frisian', key: 'fy', ISO639_3: 'fry' },
  { label: 'Xhosa', key: 'xh', ISO639_3: 'xho' },
  { label: 'Yiddish', key: 'yi', rtl: true, ISO639_3: 'yid' },
  { label: 'Yoruba', key: 'yo', ISO639_3: 'yor' },
  { label: 'Zhuang, Chuang', key: 'za', ISO639_3: 'zha' },
  { label: 'Zulu', key: 'zu', ISO639_3: 'zul' },
];

const language = (key: string, purpose: keyof typeof elasticLanguages[number] = 'elastic') => {
  const defaultValue = purpose !== 'ISO639_1' ? 'other' : null;
  return elasticLanguages[key] ? elasticLanguages[key][purpose] : defaultValue;
};

export { elasticLanguages as languages, allLanguages, language };
