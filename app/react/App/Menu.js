import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NeedAuthorization } from 'app/Auth';
import { I18NLink, I18NMenu, t } from 'app/I18N';
import { processFilters, encodeSearch } from 'app/Library/actions/libraryActions';

export class Menu extends Component {
  libraryUrl() {
    const params = processFilters(this.props.librarySearch, this.props.libraryFilters.toJS());
    return `/library/${encodeSearch(params)}`;
  }

  uploadsUrl() {
    const params = processFilters(this.props.uploadsSearch, this.props.uploadsFilters.toJS());
    return `/uploads/${encodeSearch(params)}`;
  }

  render() {
    const { links } = this.props;
    const user = this.props.user.toJS();

    const navLinks = links.map((link) => {
      const url = link.get('url') || '/';

      if (url.startsWith('http')) {
        return (
          <li key={link.get('_id')} className="menuNav-item">
            <a href={url} className="btn menuNav-btn" target="_blank">{t('Menu', link.get('title'))}</a>
          </li>
        );
      }
      return (
        <li key={link.get('_id')} className="menuNav-item">
          <I18NLink to={url} className="btn menuNav-btn">{t('Menu', link.get('title'))}</I18NLink>
        </li>
      );
    });

    return (
      <ul onClick={this.props.onClick} className={this.props.className}>
        <li className="menuItems">
          <ul className="menuNav-list">{navLinks}</ul>
        </li>
        <li className="menuActions">
          <ul className="menuNav-list">
            <li className="menuNav-item">
              <I18NLink to={this.libraryUrl()} className="menuNav-btn btn btn-default">
                <i className="fa fa-th" />
                <span className="tab-link-tooltip">{t('System', 'Public documents')}</span>
              </I18NLink>
            </li>
            <NeedAuthorization roles={['admin', 'editor']}>
              <li className="menuNav-item">
                <I18NLink to={this.uploadsUrl()} className="menuNav-btn btn btn-default">
                  <span><i className="fa fa-cloud-upload-alt" /></span>
                  <span className="tab-link-tooltip">{t('System', 'Private documents')}</span>
                </I18NLink>
              </li>
            </NeedAuthorization>
            <NeedAuthorization roles={['admin', 'editor']}>
              <li className="menuNav-item">
                <I18NLink to="/settings/account" className="menuNav-btn btn btn-default">
                  <i className="fa fa-cog" />
                  <span className="tab-link-tooltip">{t('System', 'Account settings')}</span>
                </I18NLink>
              </li>
            </NeedAuthorization>
            {(() => {
              if (!user._id) {
                return (
                  <li className="menuNav-item">
                    <I18NLink to="/login" className="menuNav-btn btn btn-default">
                      <i className="fa fa-power-off" />
                      <span className="tab-link-tooltip">{t('System', 'Sign in')}</span>
                    </I18NLink>
                  </li>
                );
              }
            })()}
          </ul>
          <I18NMenu location={this.props.location}/>
        </li>
      </ul>
    );
  }
}

Menu.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  librarySearch: PropTypes.object,
  libraryFilters: PropTypes.object,
  uploadsSearch: PropTypes.object,
  uploadsFilters: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func,
  links: PropTypes.object
};

export function mapStateToProps({ user, settings, library, uploads }) {
  return {
    user,
    librarySearch: library.search,
    libraryFilters: library.filters,
    uploadsSearch: uploads.search,
    uploadsFilters: uploads.filters,
    uploadsSelectedSorting: uploads.selectedSorting,
    links: settings.collection.get('links')
  };
}

export default connect(mapStateToProps)(Menu);
