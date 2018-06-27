import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from 'app/BasicReducer';

import UsersAPI from 'app/Users/UsersAPI';
import { notify } from 'app/Notifications/actions/notificationsActions';
import { t } from 'app/I18N';
import { Icon } from "UI";


export class AccountSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { email: props.user.email || '', password: '', repeatPassword: '' };
  }

  componentWillReceiveProps(props) {
    this.setState({ email: props.user.email || '' });
  }

  emailChange(e) {
    this.setState({ email: e.target.value });
  }

  passwordChange(e) {
    this.setState({ password: e.target.value });
    this.setState({ passwordError: false });
  }

  repeatPasswordChange(e) {
    this.setState({ repeatPassword: e.target.value });
    this.setState({ passwordError: false });
  }

  updateEmail(e) {
    e.preventDefault();
    const userData = Object.assign({}, this.props.user, { email: this.state.email });
    UsersAPI.save(userData)
    .then((result) => {
      this.props.notify(t('System', 'Email updated', null, false), 'success');
      this.props.setUser(Object.assign(userData, { _rev: result.rev }));
    });
  }

  updatePassword(e) {
    e.preventDefault();
    const passwordsDontMatch = this.state.password !== this.state.repeatPassword;
    const emptyPassword = this.state.password.trim() === '';
    if (emptyPassword || passwordsDontMatch) {
      this.setState({ passwordError: true });
      return;
    }

    UsersAPI.save(Object.assign({}, this.props.user, { password: this.state.password }))
    .then((result) => {
      this.props.notify(t('System', 'Password updated', null, false), 'success');
      this.props.setUser(Object.assign(this.props.user, { _rev: result.rev }));
    });
    this.setState({ password: '', repeatPassword: '' });
  }

  render() {
    return (
      <div className="account-settings">
        <div className="panel panel-default">
          <div className="panel-heading">
            {t('System', 'Account')}
          </div>
          <div className="panel-body">
            <h5>{t('System', 'Email address')}</h5>
            <form onSubmit={this.updateEmail.bind(this)}>
              <div className="form-group">
                <label className="form-group-label" htmlFor="collection_name">{t('System', 'Email')}</label>
                <input type="email" onChange={this.emailChange.bind(this)} value={this.state.email} className="form-control"/>
              </div>
              <button type="submit" className="btn btn-success">{t('System', 'Update')}</button>
            </form>
            <hr />
            <h5>{t('System', 'Change password')}</h5>
            <form onSubmit={this.updatePassword.bind(this)}>
              <div className={`form-group${this.state.passwordError ? ' has-error' : ''}`}>
                <label className="form-group-label" htmlFor="password">{t('System', 'New password')}</label>
                <input
                  type="password"
                  onChange={this.passwordChange.bind(this)}
                  value={this.state.password}
                  id="password"
                  className="form-control"
                />
              </div>
              <div className={`form-group${this.state.passwordError ? ' has-error' : ''}`}>
                <label className="form-group-label" htmlFor="repeatPassword">{t('System', 'Confirm new password')}</label>
                <input
                  type="password"
                  onChange={this.repeatPasswordChange.bind(this)}
                  value={this.state.repeatPassword}
                  id="repeatPassword"
                  className="form-control"
                />
              </div>
              {(() => {
                if (this.state.passwordError) {
                  return (<div className="validation-error validation-error-centered">
                    <Icon icon="exclamation-triangle" />
                            &nbsp;
                    {t('System', 'bothFieldsRequired', 'Both fields are required and should match.')}
                          </div>);
                }
              })()}
              <button type="submit" className="btn btn-success">{t('System', 'Update')}</button>
            </form>
          </div>
        </div>
        <div className="settings-footer">
          <a href="/logout" className="btn btn-danger">
            <Icon icon="sign-out-alt" />
            <i className="fa fa-sign-out-alt" />
            <span className="btn-label">{t('System', 'Logout')}</span>
          </a>
        </div>
      </div>
    );
  }
}

AccountSettings.propTypes = {
  user: PropTypes.object,
  notify: PropTypes.func,
  setUser: PropTypes.func
};

export function mapStateToProps(state) {
  return { user: state.user.toJS() };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setUser: actions.set.bind(null, 'auth/user'), notify }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
