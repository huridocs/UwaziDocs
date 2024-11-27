import { elasticLanguages } from 'shared/languagesList';
import baseProperties from './base_properties';
import settings from './settings';
import dynamicTemplates from './dynamic_templates';

const config = {
  settings,
  mappings: {
    dynamic_templates: dynamicTemplates,
    properties: baseProperties,
  },
};

elasticLanguages.forEach(({ value }) => {
  const filters = [];
  const mapping = {};

  config.settings.analysis.filter[`${value}_stop`] = {
    type: 'stop',
    stopwords: `_${value}_`,
  };

  if (value === 'arabic') {
    filters.push('arabic_normalization');
  }

  if (value === 'persian') {
    filters.push('arabic_normalization');
    filters.push('persian_normalization');
  }

  if (value !== 'persian' && value !== 'thai' && value !== 'cjk') {
    config.settings.analysis.filter[`${value}_stemmer`] = {
      type: 'stemmer',
      value,
    };

    filters.push(`${value}_stemmer`);
  }

  config.settings.analysis.analyzer[`stop_${value}`] = {
    type: 'custom',
    tokenizer: 'standard',
    filter: ['lowercase', 'asciifolding', `${value}_stop`].concat(filters),
    char_filter: ['remove_annotation'],
  };

  config.settings.analysis.analyzer[`fulltext_${value}`] = {
    type: 'custom',
    tokenizer: 'standard',
    filter: ['lowercase', 'asciifolding'].concat(filters),
    char_filter: ['remove_annotation'],
  };

  mapping[`fullText_${value}`] = {
    match: `fullText_${value}`,
    match_mapping_type: 'string',
    mapping: {
      type: 'text',
      index: true,
      analyzer: `fulltext_${value}`,
      search_analyzer: `stop_${value}`,
      search_quote_analyzer: `fulltext_${value}`,
      term_vector: 'with_positions_offsets',
    },
  };

  config.mappings.dynamic_templates.unshift(mapping);
});

export default config;
