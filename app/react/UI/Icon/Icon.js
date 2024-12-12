import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { availableLanguages } from 'shared/language';
import { loadIcons } from './library';

loadIcons();

const Icon = ({ locale = '', ...ownProps }) => {
  const languageData = availableLanguages.find(l => l.key === locale);
  return (
    <FontAwesomeIcon {...ownProps} flip={languageData && languageData.rtl ? 'horizontal' : null} />
  );
};

Icon.propTypes = {
  locale: PropTypes.string,
};

export const mapStateToProps = ({ locale }) => ({ locale });

export default connect(mapStateToProps, () => ({}))(Icon);
