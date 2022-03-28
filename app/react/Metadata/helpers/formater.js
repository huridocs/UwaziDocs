/* eslint-disable max-lines */
import moment from 'moment-timezone';
import Immutable from 'immutable';
import { advancedSort } from 'app/utils/advancedSort';
import { store } from 'app/store';
import nestedProperties from 'app/Templates/components/ViolatedArticlesNestedProperties';

const addSortedProperties = (templates, sortedProperties) =>
  templates.reduce((_property, template) => {
    if (!template.get('properties')) {
      return _property;
    }

    let matchProp = template
      .get('properties')
      .find(prop => sortedProperties.includes(`metadata.${prop.get('name')}`));

    if (matchProp) {
      matchProp = matchProp.set('type', null).set('translateContext', template.get('_id'));
    }

    return _property || matchProp;
  }, false);

const formatMetadataSortedProperties = (metadata, sortedProperties) =>
  metadata.map(prop => {
    const newProp = { ...prop };
    newProp.sortedBy = false;
    if (sortedProperties.includes(`metadata.${prop.name}`)) {
      newProp.sortedBy = true;
      if (!prop.value && prop.value !== 0) {
        newProp.value = 'No value';
        newProp.translateContext = 'System';
      }
    }
    return newProp;
  });

const addCreationDate = (result, doc) =>
  result.push({
    value: moment(doc.creationDate).format('ll'),
    label: 'Date added',
    name: 'creationDate',
    translateContext: 'System',
    sortedBy: true,
  });

const addModificationDate = (result, doc) =>
  result.push({
    value: moment(doc.editDate).format('ll'),
    label: 'Date modified',
    name: 'editDate',
    translateContext: 'System',
    sortedBy: true,
  });

const groupByParent = options =>
  options.reduce((groupedOptions, { parent, ...option }) => {
    if (!parent) {
      groupedOptions.push(option);
      return groupedOptions;
    }

    const alreadyDefinedOption = groupedOptions.find(o => o.parent === parent);
    if (alreadyDefinedOption) {
      alreadyDefinedOption.value.push(option);
      return groupedOptions;
    }

    const parentOption = { value: [option], parent };
    groupedOptions.push(parentOption);

    return groupedOptions;
  }, []);

const conformSortedProperty = (metadata, templates, doc, sortedProperties) => {
  const sortPropertyInMetadata = metadata.find(p =>
    sortedProperties.includes(`metadata.${p.name}`)
  );
  if (
    !sortPropertyInMetadata &&
    !sortedProperties.includes('creationDate') &&
    !sortedProperties.includes('editDate')
  ) {
    return metadata.push(addSortedProperties(templates, sortedProperties)).filter(p => p);
  }

  let result = formatMetadataSortedProperties(metadata, sortedProperties);

  if (sortedProperties.includes('creationDate')) {
    result = addCreationDate(result, doc);
  }

  if (sortedProperties.includes('editDate')) {
    result = addModificationDate(result, doc);
  }

  return result;
};

const propertyValueFormatter = {
  date: timestamp => moment.utc(timestamp, 'X').format('ll'),
};

export default {
  formatDateRange(daterange = {}) {
    let from = '';
    let to = '';
    if (daterange.value.from) {
      from = moment.utc(daterange.value.from, 'X').format('ll');
    }
    if (daterange.value.to) {
      to = moment.utc(daterange.value.to, 'X').format('ll');
    }
    return `${from} ~ ${to}`;
  },

  getSelectOptions(option, thesauri, doc) {
    let value = '';
    let icon;
    let parent;

    if (option) {
      value = option.label || option.value;
      icon = option.icon;
      parent = option.parent?.label;
    }

    let url;
    if (option && thesauri && thesauri.get('type') === 'template') {
      url = `/entity/${option.value}`;
    }

    let relatedEntity;
    if (doc && doc.relations) {
      const relation = doc.relations.find(e => e.entity === option.value);
      relatedEntity = relation.entityData;
    }

    return { value, url, icon, parent, relatedEntity };
  },

  multimedia(property, [{ value }], type) {
    return {
      type,
      label: property.get('label'),
      name: property.get('name'),
      style: property.get('style') || 'contain',
      noLabel: Boolean(property.get('noLabel')),
      value,
    };
  },

  date(property, date = [{}]) {
    const timestamp = date[0].value;
    const value = propertyValueFormatter.date(timestamp);
    return {
      label: property.get('label'),
      name: property.get('name'),
      value,
      timestamp,
    };
  },

  daterange(property, daterange) {
    return {
      label: property.get('label'),
      name: property.get('name'),
      value: this.formatDateRange(daterange[0]),
    };
  },

  multidate(property, timestamps = []) {
    const value = timestamps.map(timestamp => ({
      timestamp: timestamp.value,
      value: moment.utc(timestamp.value, 'X').format('ll'),
    }));
    return { label: property.get('label'), name: property.get('name'), value };
  },

  multidaterange(property, dateranges = []) {
    const value = dateranges.map(range => ({ value: this.formatDateRange(range) }));
    return { label: property.get('label'), name: property.get('name'), value };
  },

  image(property, value) {
    return this.multimedia(property, value, 'image');
  },

  link(_property, [value]) {
    return { ...value, type: 'link' };
  },

  preview(property, _value, _thesauris, { doc }) {
    const defaultDoc = doc.defaultDoc || {};
    return this.multimedia(
      property,
      [{ value: defaultDoc._id ? `/api/files/${defaultDoc._id}.jpg` : null }],
      'image'
    );
  },

  media(property, value) {
    return this.multimedia(property, value, 'media');
  },

  default(_property, [value]) {
    return value;
  },

  geolocation(property, value, _thesauris, { onlyForCards }) {
    return {
      label: property.get('label'),
      name: property.get('name'),
      value: value.map(geolocation => geolocation.value),
      onlyForCards: Boolean(onlyForCards),
      type: 'geolocation',
    };
  },

  select(property, [metadataValue], thesauris) {
    const thesauri = thesauris.find(thes => thes.get('_id') === property.get('content'));
    const { value, url, icon, parent } = this.getSelectOptions(metadataValue, thesauri);
    return { label: property.get('label'), name: property.get('name'), value, icon, url, parent };
  },

  multiselect(property, thesauriValues, thesauris) {
    const thesauri = thesauris.find(thes => thes.get('_id') === property.get('content'));
    const sortedValues = this.getThesauriValues(thesauriValues, thesauri);

    const groupsOptions = groupByParent(sortedValues);
    return { label: property.get('label'), name: property.get('name'), value: groupsOptions };
  },

  // eslint-disable-next-line max-params, max-statements
  inherit(property, propValue = [], thesauris, options, templates) {
    const template = templates.find(templ => templ.get('_id') === property.get('content'));
    const inheritedProperty = template
      .get('properties')
      .find(p => p.get('_id') === property.getIn(['inherit', 'property']));

    const type = inheritedProperty.get('type');
    const methodType = this[type] ? type : 'default';
    let value = propValue
      .map(v => {
        if (v && v.inheritedValue) {
          if (
            !v.inheritedValue.length ||
            v.inheritedValue.every(
              iv => !(iv.value || type === null || (type === 'numeric' && iv.value === 0))
            )
          ) {
            return null;
          }

          return this[methodType](
            inheritedProperty,
            v.inheritedValue,
            thesauris,
            options,
            templates
          );
        }

        return {};
      })
      .filter(v => v);
    let propType = 'inherit';
    if (['multidate', 'multidaterange', 'multiselect', 'geolocation'].includes(type)) {
      const templateThesauris = thesauris.find(
        _thesauri => _thesauri.get('_id') === template.get('_id')
      );
      propType = type;
      value = this.flattenInheritedMultiValue(value, type, propValue, templateThesauris, {
        doc: options.doc,
      });
    }
    value = value.filter(v => v);
    return {
      translateContext: template.get('_id'),
      ...inheritedProperty.toJS(),
      name: property.get('name'),
      inheritedName: inheritedProperty.get('name'),
      value,
      label: property.get('label'),
      type: propType,
      inheritedType: type,
      onlyForCards: Boolean(options.onlyForCards),
      indexInTemplate: property.get('indexInTemplate'),
    };
  },

  // eslint-disable-next-line max-params
  flattenInheritedMultiValue(relationshipValues, type, thesauriValues, templateThesauris, { doc }) {
    return relationshipValues.reduce((result, relationshipValue, index) => {
      if (relationshipValue.value) {
        let { value } = relationshipValue;
        if (type === 'geolocation') {
          const options = this.getSelectOptions(thesauriValues[index], templateThesauris, doc);
          const entityLabel = options.value;
          value = value.map(v => ({
            ...v,
            relatedEntity: options.relatedEntity ? options.relatedEntity : undefined,
            label: `${entityLabel}${v.label ? ` (${v.label})` : ''}`,
          }));
        }
        return result.concat(value);
      }
      return result;
    }, []);
  },

  relationship(property, thesauriValues, thesauris, { doc }) {
    const thesauri =
      thesauris.find(thes => thes.get('_id') === property.get('content')) ||
      Immutable.fromJS({
        type: 'template',
      });
    const sortedValues = this.getThesauriValues(thesauriValues, thesauri, doc);
    return { label: property.get('label'), name: property.get('name'), value: sortedValues };
  },

  markdown(property, [{ value }], _thesauris, { type }) {
    return {
      label: property.get('label'),
      name: property.get('name'),
      value,
      type: type || 'markdown',
    };
  },

  nested(property, rows, thesauris) {
    if (!rows[0]) {
      return { label: property.get('label'), name: property.get('name'), value: '' };
    }

    const { locale } = store.getState();
    const keys = Object.keys(rows[0].value).sort();
    const translatedKeys = keys.map(key =>
      nestedProperties[key.toLowerCase()]
        ? nestedProperties[key.toLowerCase()][`key_${locale}`]
        : key
    );
    let result = `| ${translatedKeys.join(' | ')}|\n`;
    result += `| ${keys.map(() => '-').join(' | ')}|\n`;
    result += `${rows
      .map(row => `| ${keys.map(key => (row.value[key] || []).join(', ')).join(' | ')}`)
      .join('|\n')}|`;

    return this.markdown(property, [{ value: result }], thesauris, { type: 'markdown' });
  },

  getThesauriValues(thesauriValues, thesauri, doc) {
    return advancedSort(
      thesauriValues
        .map(thesauriValue => this.getSelectOptions(thesauriValue, thesauri, doc))
        .filter(v => v.value),
      { property: 'value' }
    );
  },

  prepareMetadataForCard(doc, templates, thesauris, sortedProperty) {
    return this.prepareMetadata(doc, templates, thesauris, null, {
      onlyForCards: true,
      sortedProperties: [sortedProperty],
    });
  },

  prepareMetadata(_doc, templates, thesauris, relationships, _options = {}) {
    const doc = { metadata: {}, ..._doc };
    const options = { sortedProperties: [], ..._options };
    const template = templates.find(temp => temp.get('_id') === doc.template);

    if (!template || !thesauris.size) {
      return { ...doc, metadata: [], documentType: '' };
    }

    let metadata = template
      .get('properties')
      .map((p, index) => p.set('indexInTemplate', index))
      .filter(
        this.filterProperties(options.onlyForCards, options.sortedProperties, {
          excludePreview: options.excludePreview,
        })
      )
      .map(property =>
        this.applyTransformation(property, {
          doc,
          thesauris,
          options,
          template,
          templates,
          relationships,
        })
      );

    metadata = conformSortedProperty(metadata, templates, doc, options.sortedProperties);

    return { ...doc, metadata: metadata.toJS(), documentType: template.get('name') };
  },

  applyTransformation(property, { doc, thesauris, options, template, templates }) {
    const value = doc.metadata[property.get('name')];
    const showInCard = property.get('showInCard');

    if (property.get('inherit')) {
      return this.inherit(property, value, thesauris, { ...options, doc }, templates);
    }

    const methodType = this[property.get('type')] ? property.get('type') : 'default';

    if ((value && value.length) || methodType === 'preview') {
      return {
        translateContext: template.get('_id'),
        ...property.toJS(),
        ...this[methodType](property, value, thesauris, { ...options, doc }),
      };
    }

    return {
      label: property.get('label'),
      name: property.get('name'),
      value,
      showInCard,
      translateContext: template.get('_id'),
    };
  },

  filterProperties(onlyForCards, sortedProperties, options = {}) {
    return p => {
      if (options.excludePreview && p.get('type') === 'preview') {
        return false;
      }

      if (!onlyForCards) {
        return true;
      }

      if (p.get('showInCard') || sortedProperties.includes(`metadata.${p.get('name')}`)) {
        return true;
      }

      return false;
    };
  },
};

export { propertyValueFormatter };
