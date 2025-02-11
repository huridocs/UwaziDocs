export default {
  filterBaseProperties: data => {
    const properties = [
      '_id',
      '__v',
      'language',
      'metadata',
      'suggestedMetadata',
      'sharedId',
      'template',
      'title',
      'icon',
      'type',
      'attachments',
      'documents',
    ];
    return Object.assign({}, ...properties.map(p => ({ [p]: data[p] })));
  },
};
