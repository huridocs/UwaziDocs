import Immutable from 'immutable';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from 'app/Layout/Icon';
import { TemplateLabel, DocumentLanguage } from 'app/Layout';
import { caseTemplate, matterTemplate } from 'app/Timeline/utils/timelineFixedData';
import ShowIf from 'app/App/ShowIf';
import TimelineViewer from 'app/Timeline/components/TimelineViewer';
import ItemPreview from 'app/Library/components/ItemPreview';

import FormatMetadata from '../containers/FormatMetadata';

export class ShowMetadata extends Component {
  render() {
    const { entity, showTitle, showType } = this.props;
    let header = '';
    if (showTitle || showType) {
      let title = '';
      if (showTitle) {
        title = (
          <div>
            <Icon className="item-icon item-icon-center" data={entity.icon} />
            <h1 className="item-name">
              {entity.title}
              <DocumentLanguage doc={Immutable.fromJS(entity)} />
            </h1>
          </div>
        );
      }
      const type = showType ? <TemplateLabel template={entity.template}/> : '';
      header = <div className="item-info">{title}{type}</div>;
    }

    if (!Object.keys(entity).length) {
      return <div className="view"/>;
    }

    return (
      <div className="view">
        {header}

        <ShowIf if={entity.template === caseTemplate || entity.template === matterTemplate}>
          <dl>
            <dd><TimelineViewer entity={entity} /></dd>
          </dl>
        </ShowIf>
        <ItemPreview entity={entity}/>
        <FormatMetadata entity={entity} />
      </div>
    );
  }
}

ShowMetadata.propTypes = {
  entity: PropTypes.object,
  templates: PropTypes.object,
  showTitle: PropTypes.bool,
  showType: PropTypes.bool
};

const mapStateToProps = ({ templates }) => ({ templates });

export default connect(mapStateToProps)(ShowMetadata);
