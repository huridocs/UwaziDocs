import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'UI';

import { Translate, I18NLink } from 'app/I18N';
import { notify } from 'app/Notifications/actions/notificationsActions';
import { store } from 'app/store';
import Icons from 'app/Templates/components/Icons';
import { IImmutable } from 'shared/types/Immutable';
import { TemplateSchema } from 'shared/types/templateType';
import { PropertySchema } from 'shared/types/commonTypes';

function mapStateToProps({ settings, templates }: any) {
  return {
    extractionSettings: settings.collection
      .get('features')
      ?.get('metadataExtraction')
      .get('templates'),
    templates,
  };
}

class MetadataExtractionComponent extends React.Component<
  MetadataExtractionDashboardPropTypes,
  MetadataExtractionDashboardStateTypes
> {
  constructor(props: MetadataExtractionDashboardPropTypes) {
    super(props);
    this.state = {
      formattedData: {},
    };
  }

  componentDidMount() {
    this.arrangeTemplatesAndProperties();
  }

  arrangeTemplatesAndProperties() {
    const formatted: FormattedSettingsData = {};

    this.props.extractionSettings.forEach(setting => {
      const template = setting.has('template')
        ? this.props.templates.find(temp => temp?.get('_id') === setting.get('template'))
        : this.props.templates.find(temp => temp?.get('name') === setting.get('name'));

      if (!template) {
        store?.dispatch(
          notify(`Template "${setting.get('_id') || setting.get('name')}" not found.`, 'warning')
        );
        return;
      }

      const rawProperties = setting.get('properties');
      const properties: Array<string> | undefined =
        typeof rawProperties === 'string' ? [rawProperties] : rawProperties;
      properties?.forEach(propertyName => {
        let property = template.get('properties')?.find(p => p?.get('name') === propertyName);
        let label;
        if (!property) {
          property = template.get('commonProperties')?.find(p => p?.get('name') === propertyName);
          label = propertyName;
        } else {
          label = property.get('label');
        }
        if (!property) {
          store?.dispatch(
            notify(
              `Property "${label}" not found on template "${template.get('name')}".`,
              'warning'
            )
          );
          return;
        }
        if (!formatted.hasOwnProperty(propertyName)) {
          formatted[propertyName] = {
            properties: [property.toJS()],
            templates: [template.toJS()],
          };
        } else {
          formatted[propertyName].properties.push(property.toJS());
          formatted[propertyName].templates.push(template.toJS());
        }
      });
    });
    this.setState({ formattedData: formatted });
  }

  render() {
    return (
      <>
        <div className="panel panel-default">
          <div className="panel-heading">
            <Translate>Metadata extraction dashboard</Translate>
          </div>
          <div className="panel-subheading">
            <Translate>Extract information from your documents</Translate>
          </div>
          <div className="metadata-extraction-table">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <Translate>Metadata to extract</Translate>
                  </th>
                  <th>
                    <Translate>Template</Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.state.formattedData).map(([propIndex, data]) => (
                  <tr key={propIndex}>
                    <td>
                      <Icon icon={Icons[data.properties[0].type]} fixedWidth />
                      {data.properties[0].label}
                    </td>
                    <td className="templateNameViewer">
                      {data.templates.map((template, index) => (
                        <div key={template.name}>
                          {template.name}
                          {index !== data.templates.length - 1 ? ',' : ''}
                        </div>
                      ))}
                    </td>
                    <td>
                      <I18NLink
                        to={`settings/metadata_extraction/suggestions/${data.properties[0].name}`}
                        className="btn btn-success btn-xs"
                      >
                        <Icon icon="bars" />
                        &nbsp;
                        <Translate>Review</Translate>
                      </I18NLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}

export interface MetadataExtractionDashboardPropTypes {
  templates: IImmutable<TemplateSchema[]>;
  extractionSettings: Map<string, string | Array<string>>[];
}

export interface FormattedSettingsData {
  [key: string]: {
    properties: PropertySchema[];
    templates: TemplateSchema[];
  };
}

export interface MetadataExtractionDashboardStateTypes {
  formattedData: FormattedSettingsData;
}

export const MetadataExtractionDashboard = connect(mapStateToProps)(MetadataExtractionComponent);
