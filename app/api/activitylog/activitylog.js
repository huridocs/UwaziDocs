import model from './activitylogModel';
import { getSemanticData } from './activitylogParser';

const prepareRegexpQueries = query => {
  const result = {};

  if (query.url) {
    result.url = new RegExp(query.url);
  }
  if (query.query) {
    result.query = new RegExp(query.query);
  }
  if (query.body) {
    result.body = new RegExp(query.body);
  }
  if (query.params) {
    result.params = new RegExp(query.params);
  }

  return result;
};

const prepareQuery = query => {
  if (!query.find) {
    return prepareRegexpQueries(query);
  }
  const term = new RegExp(query.find);
  return {
    $or: [{ method: term }, { url: term }, { query: term }, { body: term }, { params: term }],
  };
};

const prepareToFromRanges = sanitizedTime => {
  const time = {};

  if (sanitizedTime.from) {
    time.$gte = parseInt(sanitizedTime.from, 10) * 1000;
  }

  if (sanitizedTime.to) {
    time.$lte = parseInt(sanitizedTime.to, 10) * 1000;
  }

  return time;
};

const timeQuery = ({ time = {}, before = null }) => {
  const sanitizedTime = Object.keys(time).reduce(
    (memo, k) => (time[k] !== null ? Object.assign(memo, { [k]: time[k] }) : memo),
    {}
  );

  if (before === null && !Object.keys(sanitizedTime).length) {
    return {};
  }

  const result = { time: prepareToFromRanges(sanitizedTime) };

  if (before !== null) {
    result.time.$lt = parseInt(before, 10);
  }

  return result;
};

const getPagination = query => {
  const { page } = query;
  const limit = parseInt(query.limit || 15, 10);
  const paginationOptions = { limit, sort: { time: -1 } };
  if (page) {
    paginationOptions.skip = (page - 1) * limit;
  }
  return paginationOptions;
};

export default {
  save(entry) {
    return model.save(entry);
  },

  async get(query = {}) {
    const mongoQuery = Object.assign(prepareQuery(query), timeQuery(query));

    if (query.method && query.method.length) {
      mongoQuery.method = { $in: query.method };
    }

    if (query.username) {
      mongoQuery.username =
        query.username !== 'anonymous' ? query.username : { $in: [null, query.username] };
    }

    const limitQuery = getPagination(query);

    const totalRows = await model.count(mongoQuery);
    const dbResults = await model.get(mongoQuery, null, limitQuery);

    const semanticResults = await dbResults.reduce(async (prev, logEntry) => {
      const results = await prev;
      const semantic = await getSemanticData(logEntry);
      return results.concat([{ ...logEntry, semantic }]);
    }, Promise.resolve([]));

    return {
      rows: semanticResults,
      remainingRows: Math.max(0, totalRows - dbResults.length - (limitQuery.skip || 0)),
      limit: limitQuery.limit,
      page: query.page,
    };
  },
};
