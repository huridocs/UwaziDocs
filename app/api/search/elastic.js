import elasticSearch from 'elasticsearch';

const elastic = new elasticSearch.Client({
  host: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  maxRetries: 5,
  requestTimeout: 60000,
});

export default elastic;
