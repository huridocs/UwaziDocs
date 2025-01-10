import PropTypes from 'prop-types';
import React from 'react';

import { Icon } from 'UI';
import { I18NLink } from 'app/I18N';
import { t } from 'V2/i18n';
const BackButton = ({ to, className }) => (
  <I18NLink to={to} className={`btn btn-default ${className}`}>
    <Icon icon="arrow-left" />
    <span className="btn-label">{t('System', 'Back')}</span>
  </I18NLink>
);

BackButton.defaultProps = {
  to: '',
  className: '',
};

BackButton.propTypes = {
  to: PropTypes.string,
  className: PropTypes.string,
};

export default BackButton;
