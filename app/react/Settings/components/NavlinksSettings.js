import { DragDropContext } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Form } from 'react-redux-form';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from 'UI';
import { isClient } from 'app/utils';
import { loadLinks, addLink, sortLink, saveLinks } from 'app/Settings/actions/navlinksActions';
import { Translate } from 'app/I18N';
import validator from 'app/Settings/utils/ValidateNavlinks';

import NavlinkForm from './NavlinkForm';
import './styles/menu.scss';

export class NavlinksSettings extends Component {
  componentDidMount() {
    this.props.loadLinks(this.props.collection.get('links').toJS());
  }

  render() {
    const { collection, links } = this.props;
    const nameGroupClass = 'template-name';
    const hostname = isClient ? window.location.origin : '';

    const payload = { _id: collection.get('_id'), _rev: collection.get('_rev'), links };

    return (
      <div className="NavlinksSettings">
        <Form
          model="settings.navlinksData"
          onSubmit={this.props.saveLinks.bind(this, payload)}
          className="navLinks"
          validators={validator(links)}
        >
          <div className="panel panel-default">
            <div className="panel-heading">
              <div className={nameGroupClass}>
                <Translate>Menu</Translate>
              </div>
            </div>
            <ul className="list-group">
              <li className="list-group-item">
                <div className="alert alert-info">
                  <Icon icon="info-circle" size="2x" />
                  <div className="force-ltr">
                    <Translate>
                      If it is an external URL, use a fully formed URL. Ie. http://www.uwazi.io.
                    </Translate>
                    <br />
                    <Translate>
                      If it is an internal URL within this website, be sure to delete the first part
                    </Translate>{' '}
                    ({hostname}),{' '}
                    <Translate>
                      leaving only a relative URL starting with a slash character. Ie. /some_url.
                    </Translate>
                  </div>
                </div>
              </li>
              {links.map((link, i) => (
                <NavlinkForm
                  key={link.localID || link._id}
                  index={i}
                  id={link.localID || link._id}
                  link={link}
                  sortLink={this.props.sortLink}
                />
              ))}
              <li className="list-group-item">
                <div className="footer-buttons">
                  <button
                    type="button"
                    className="menu-link-group-button"
                    id="main-add-link-button"
                    onClick={this.props.addLink.bind(this, links, 'link')}
                  >
                    <Icon icon="link" />
                    &nbsp;<Translate>Add link</Translate>
                  </button>
                  <button
                    type="button"
                    className="menu-link-group-button"
                    onClick={this.props.addLink.bind(this, links, 'group')}
                  >
                    <Icon icon="caret-square-down" />
                    &nbsp;<Translate>Add group</Translate>
                  </button>
                </div>
              </li>
            </ul>
            <div className="settings-footer">
              <button
                type="submit"
                className="btn btn-success"
                disabled={!!this.props.savingNavlinks}
              >
                <Icon icon="save" />
                <span className="btn-label">
                  <Translate>Save</Translate>
                </span>
              </button>
            </div>
          </div>
        </Form>
      </div>
    );
  }
}

NavlinksSettings.propTypes = {
  collection: PropTypes.object,
  links: PropTypes.array,
  loadLinks: PropTypes.func.isRequired,
  addLink: PropTypes.func.isRequired,
  sortLink: PropTypes.func.isRequired,
  saveLinks: PropTypes.func.isRequired,
  savingNavlinks: PropTypes.bool,
};

export const mapStateToProps = state => {
  const { settings } = state;
  const { collection } = settings;
  const { links } = settings.navlinksData;
  return { links, collection, savingNavlinks: settings.uiState.get('savingNavlinks') };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ loadLinks, addLink, sortLink, saveLinks }, dispatch);
}

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(NavlinksSettings)
);
