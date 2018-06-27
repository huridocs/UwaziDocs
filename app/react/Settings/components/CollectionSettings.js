import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { isClient } from 'app/utils';

import { actions } from 'app/BasicReducer';
import SettingsAPI from 'app/Settings/SettingsAPI';
import { notify } from 'app/Notifications/actions/notificationsActions';
import { RadioButtons } from 'app/Forms';
import { t } from 'app/I18N';
import { Icon } from "UI";

export class CollectionSettings extends Component {
  constructor(props, context) {
    super(props, context);
    const dateSeparator = props.settings.dateFormat && props.settings.dateFormat.includes('/') ? '/' : '-';
    this.state = {
      siteName: props.settings.site_name || '',
      homePage: props.settings.home_page || '',
      mailerConfig: props.settings.mailerConfig || '',
      analyticsTrackingId: props.settings.analyticsTrackingId || '',
      private: props.settings.private || false,
      customLandingpage: !!props.settings.home_page,
      dateFormat: props.settings.dateFormat,
      dateSeparator
    };
  }

  dateFormatSeparatorOptions() {
    return [
      { label: '/', value: '/' },
      { label: '-', value: '-' }
    ];
  }

  dateFormatOptions(separator) {
    return [
      { label: 'Year, Month, Day', value: `YYYY${separator}MM${separator}DD` },
      { label: 'Day, Month, Year', value: `DD${separator}MM${separator}YYYY` },
      { label: 'Month, Day, Year', value: `MM${separator}DD${separator}YYYY` }
    ];
  }

  renderDateFormatLabel(option) {
    return <span>{option.label} <code>{moment().format(option.value)}</code></span>;
  }

  changeLandingPage(e) {
    const customLandingpage = e.target.value === 'custom';
    this.setState({ customLandingpage, homePage: '' });
    const settings = Object.assign(this.props.settings, { home_page: '' }); // eslint-disable-line camelcase
    this.props.setSettings(settings);
  }

  changeName(e) {
    this.setState({ siteName: e.target.value });
    const settings = Object.assign(this.props.settings, { site_name: e.target.value }); // eslint-disable-line camelcase
    this.props.setSettings(settings);
  }

  changeMailerConfig(e) {
    this.setState({ mailerConfig: e.target.value });
    const settings = Object.assign(this.props.settings, { mailerConfig: e.target.value });
    this.props.setSettings(settings);
  }

  changeAnalyticsTrackingId(e) {
    this.setState({ analyticsTrackingId: e.target.value });
    const settings = Object.assign(this.props.settings, { analyticsTrackingId: e.target.value });
    this.props.setSettings(settings);
  }

  changePrivate() {
    const privateInstance = !this.state.private;
    this.setState({ private: privateInstance });
    const settings = Object.assign(this.props.settings, { private: privateInstance });
    this.props.setSettings(settings);
  }

  changeHomePage(e) {
    this.setState({ homePage: e.target.value });
    const settings = Object.assign(this.props.settings, { home_page: e.target.value }); // eslint-disable-line camelcase
    this.props.setSettings(settings);
  }

  changeDateFormat(dateFormat) {
    this.setState({ dateFormat });
    const settings = Object.assign(this.props.settings, { dateFormat });
    this.props.setSettings(settings);
  }

  changeDateFormatSeparator(dateSeparator) {
    const selectedFormatPosition = this.dateFormatSeparatorOptions().reduce((position, separator) => {
      const dateFormatOptions = this.dateFormatOptions(separator.value);
      const foundFormat = dateFormatOptions.find(s => s.value === this.state.dateFormat);
      return foundFormat ? dateFormatOptions.indexOf(foundFormat) : position;
    }, null);

    const dateFormat = this.dateFormatOptions(dateSeparator)[selectedFormatPosition] ?
      this.dateFormatOptions(dateSeparator)[selectedFormatPosition].value : '';

    this.setState({ dateSeparator, dateFormat });
    const settings = Object.assign(this.props.settings, { dateFormat });
    this.props.setSettings(settings);
  }

  updateSettings(e) {
    e.preventDefault();
    const settings = Object.assign({}, this.props.settings);
    settings.home_page = this.state.homePage; // eslint-disable-line camelcase
    settings.site_name = this.state.siteName; // eslint-disable-line camelcase
    settings.mailerConfig = this.state.mailerConfig;
    settings.analyticsTrackingId = this.state.analyticsTrackingId;
    settings.private = this.state.private;
    SettingsAPI.save(settings)
    .then((result) => {
      this.props.notify(t('System', 'Settings updated', null, false), 'success');
      this.props.setSettings(result);
    });
  }

  render() {
    const hostname = isClient ? window.location.origin : '';

    return (
      <div className="panel panel-default">
        <div className="panel-heading">{t('System', 'Collection')}</div>
        <div className="panel-body">
          <form onSubmit={this.updateSettings.bind(this)}>
            <div className="form-group">
              <label className="form-group-label" htmlFor="collection_name">{t('System', 'Name')}</label>
              <input onChange={this.changeName.bind(this)} value={this.state.siteName} type="text" className="form-control"/>
            </div>
            <div className="form-group">
              <label className="form-group-label" htmlFor="collection_name">{t('System', 'Private instance')}</label>
              <div className="checkbox">
                <label>
                  <input
                    onChange={this.changePrivate.bind(this)}
                    name="private"
                    type="checkbox"
                    checked={this.state.private}
                  />
                  {t('System', 'check as private instance')}
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-group-label">{t('System', 'Date format')}</label>
              <div>{t('System', 'Separator')}</div>
              <RadioButtons
                options={this.dateFormatSeparatorOptions()}
                value={this.state.dateSeparator}
                onChange={this.changeDateFormatSeparator.bind(this)}
              />
              <div>{t('System', 'Order')}</div>
              <RadioButtons
                options={this.dateFormatOptions(this.state.dateSeparator)}
                value={this.state.dateFormat}
                onChange={this.changeDateFormat.bind(this)}
                renderLabel={this.renderDateFormatLabel}
              />
            </div>
            <h2>{t('System', 'Advanced settings')}</h2>
            <div className="form-group">
              <label className="form-group-label" htmlFor="collection_name">{t('System', 'Landing page')}</label>
              <div className="radio">
                <label>
                  <input
                    onChange={this.changeLandingPage.bind(this)}
                    name="landingPage"
                    type="radio"
                    value="library"
                    checked={!this.state.customLandingpage}
                  />
                  {t('System', 'Library')}
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    onChange={this.changeLandingPage.bind(this)}
                    name="landingPage"
                    type="radio"
                    value="custom"
                    checked={this.state.customLandingpage}
                  />
                  {t('System', 'Custom page')}
                </label>
              </div>
              <div className="input-group">
                <span disabled={!this.state.customLandingpage} className="input-group-addon">
                  {hostname}
                </span>
                <input
                  disabled={!this.state.customLandingpage}
                  onChange={this.changeHomePage.bind(this)}
                  value={this.state.homePage}
                  type="text"
                  className="form-control"
                />
              </div>
            </div>
            <div className="alert alert-info">
              <Icon icon="home" />
              <div>
                The landing page is the first thing users will see when visiting your Uwazi instance.<br />
                You can use any URL from your Uwazi instance as a landing page, examples:
                <ul>
                  <li>A page: /page/dicxg0oagy3xgr7ixef80k9</li>
                  <li>Library results: /library/?searchTerm=test</li>
                  <li>An entity: /entity/9htbkgpkyy7j5rk9</li>
                  <li>A document: /document/4y9i99fadjp833di</li>
                </ul>
                Always use URLs relative to your site, starting with / and skipping the https://yoursite.com/.
              </div>
            </div>
            <div className="form-group">
              <label className="form-group-label" htmlFor="collectionMailerConfig">{t('System', 'Google Analytics ID')}</label>
              <input
                name="analyticsTrackingId"
                onChange={this.changeAnalyticsTrackingId.bind(this)}
                value={this.state.analyticsTrackingId}
                type="text"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-group-label" htmlFor="collectionMailerConfig">{t('System', 'Mailer configuration')}</label>
              <textarea
                name="collectionMailerConfig"
                onChange={this.changeMailerConfig.bind(this)}
                value={this.state.mailerConfig}
                type="text"
                className="form-control"
                rows="5"
              />
            </div>
            <div className="alert alert-info">
              <Icon icon="envelope" />
              <div>
                This is a JSON configuration object that should match the options values required by Nodemailer,
                as explained in <a href="https://nodemailer.com/smtp/" target="_blank">nodemailer.com/smtp/</a><br />
                This setting takes precedence over all other mailer configuration.<br />
                If left blank, then the configuration file in /api/config/mailer.js will be used.
              </div>
            </div>
            <div className="settings-footer">
              <button type="submit" className="btn btn-success">
                <Icon icon="save" />
                <span className="btn-label">{t('System', 'Save')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

CollectionSettings.propTypes = {
  settings: PropTypes.object,
  setSettings: PropTypes.func,
  notify: PropTypes.func
};

export function mapStateToProps(state) {
  return { settings: state.settings.collection.toJS() };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setSettings: actions.set.bind(null, 'settings/collection'), notify }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionSettings);
