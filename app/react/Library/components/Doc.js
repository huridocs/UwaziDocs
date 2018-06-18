import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {wrapDispatch} from 'app/Multireducer';
import {connect} from 'react-redux';
import {NeedAuthorization} from 'app/Auth';
import ShowIf from 'app/App/ShowIf';
import {t, I18NLink} from 'app/I18N';
import {publish} from 'app/Uploads/actions/uploadsActions';
import UploadEntityStatus from 'app/Library/components/UploadEntityStatus';
import { Icon } from 'UI';

import {Item} from 'app/Layout';
import {is} from 'immutable';

export class Doc extends Component {

  deleteConnection(e, connection) {
    e.stopPropagation();
    const {_id, sourceType} = connection;
    this.props.deleteConnection({_id, sourceType});
  }

  getConnections(connections) {
    return (
      <div>
        {connections.map((connection, index) =>
          <div key={index} className="item-connection">
            <div>
              <Icon icon="exchange-alt" />
              <span>
                {t(connection.context, connection.label)}
                {connection.type === 'metadata' ? ' ' + t('System', 'in') + '...' : ''}
              </span>
            </div>
            <NeedAuthorization roles={['admin', 'editor']}>
              <ShowIf if={connection.sourceType !== 'metadata'}>
                <button className="btn btn-default btn-hover-danger btn-xs" onClick={e => this.deleteConnection(e, connection)}>
                  <Icon icon="trash-alt" />
                </button>
              </ShowIf>
            </NeedAuthorization>
          </div>
        )}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return !is(this.props.doc, nextProps.doc) ||
           this.props.active !== nextProps.active ||
           this.props.searchParams && nextProps.searchParams && this.props.searchParams.sort !== nextProps.searchParams.sort;
  }

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e, this.props.doc, this.props.active);
    }
  }

  publish(e) {
    e.stopPropagation();
    this.context.confirm({
      accept: () => {
        this.props.publish(this.props.doc.toJS());
      },
      title: 'Confirm',
      message: 'Are you sure you want to publish this entity?',
      type: 'success'
    });
  }

  render() {
    const {className, additionalText} = this.props;
    const doc = this.props.doc.toJS();
    const {sharedId, type, template} = doc;
    const isEntity = type === 'entity';
    const hasTemplate = !!template;
    let documentViewUrl = `/${type}/${sharedId}`;

    let itemConnections = null;
    if (doc.connections && doc.connections.length) {
      itemConnections = this.getConnections(doc.connections);
    }

    const buttons = <div>
                      {doc.processed || isEntity ?
                        <I18NLink to={documentViewUrl} className="btn btn-default btn-xs" onClick={(e) => e.stopPropagation()}>
                          <Icon icon="angle-right" /> { t('System', 'View') }
                        </I18NLink> : false
                      }
                      {(doc.processed || isEntity) && !doc.published && hasTemplate ?
                        <button className="btn btn-success btn-xs" onClick={this.publish.bind(this)}>
                          <Icon icon="paper-plane" /> { t('System', 'Publish') }
                        </button> : false
                      }
                    </div>;

    return <Item onClick={this.onClick.bind(this)}
                 onSnippetClick={this.props.onSnippetClick}
                 active={this.props.active}
                 doc={this.props.doc}
                 additionalText={additionalText}
                 searchParams={this.props.searchParams}
                 deleteConnection={this.props.deleteConnection}
                 itemHeader={itemConnections}
                 buttons={buttons}
                 labels={<UploadEntityStatus doc={this.props.doc}/>}
                 className={className}
            />;
  }
}

Doc.propTypes = {
  doc: PropTypes.object,
  searchParams: PropTypes.object,
  active: PropTypes.bool,
  authorized: PropTypes.bool,
  deleteConnection: PropTypes.func,
  publish: PropTypes.func,
  onSnippetClick: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
  additionalText: PropTypes.string
};

Doc.contextTypes = {
  confirm: PropTypes.func
};

export function mapStateToProps(state, ownProps) {
  const active = ownProps.storeKey ? !!state[ownProps.storeKey].ui.get('selectedDocuments')
  .find((doc) => doc.get('_id') === ownProps.doc.get('_id')) : false;

  return {
    active
  };
}

function mapDispatchToProps(dispatch, props) {
  return bindActionCreators({publish}, wrapDispatch(dispatch, props.storeKey));
}

export default connect(mapStateToProps, mapDispatchToProps)(Doc);
