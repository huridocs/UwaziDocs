import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { toUrlParams } from 'shared/JSONRequest';

const newParams = (oldQuery, newQuery) => {
  const params = { ...oldQuery, ...newQuery };
  return Object.keys(params).reduce((memo, key) => {
    if (params[key] !== '') {
      return Object.assign(memo, { [key]: params[key] });
    }
    return memo;
  }, {});
};

const validProps = props => {
  const { to, ...valid } = props;
  return valid;
};

const CurrentLocationLink = ({ children, queryParams, ...otherProps }) => {
  const location = useLocation();
  return (
    <Link
      to={`${location.pathname}${toUrlParams(newParams(location.query, queryParams))}`}
      {...validProps(otherProps)}
    >
      {children}
    </Link>
  );
};

CurrentLocationLink.defaultProps = {
  children: '',
  queryParams: {},
};

CurrentLocationLink.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  queryParams: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export { CurrentLocationLink };

export default CurrentLocationLink;
