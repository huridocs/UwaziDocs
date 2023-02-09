import React from 'react';
import _ from 'lodash';
import { connect, ConnectedProps } from 'react-redux';
import { ClientTemplateSchema, IStore } from 'app/istore';
import { acceptSuggestion } from 'app/MetadataExtraction/actions/actions';
import { EntitySuggestions } from 'app/MetadataExtraction/EntitySuggestions';
import { IImmutable } from 'shared/types/Immutable';
import { ensure } from 'shared/tsUtils';
import GeneralError from 'app/App/ErrorHandling/GeneralError';

const SuggestionComponent = ({
  routeParams: { propertyName },
  templates,
  acceptSuggestion: acceptIXSuggestion,
  languages,
}: ComponentProps) => {
  const propertiesKey = propertyName === 'title' ? 'commonProperties' : 'properties';

  const property = templates
    .map(template =>
      ensure<IImmutable<ClientTemplateSchema>>(template)
        .get(propertiesKey)
        ?.find(p => p?.get('name') === propertyName)
    )
    .filter(v => !_.isUndefined(v));
  if (property && property.size > 0) {
    return (
      <div className="settings-content">
        <EntitySuggestions
          property={property.get(0)!.toJS()}
          acceptIXSuggestion={acceptIXSuggestion}
          languages={languages?.toArray()}
        />
      </div>
    );
  }
  return (
    <div className="settings-content">
      <GeneralError />
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  templates: state.templates,
  languages: state.settings.collection.get('languages'),
});

const mapDispatchToProps = {
  acceptSuggestion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type MappedProps = ConnectedProps<typeof connector>;

type ComponentProps = SuggestionsContainerProps & MappedProps;

export interface SuggestionsContainerProps {
  routeParams: {
    propertyName: string;
  };
}

export const IXSuggestions = connect(mapStateToProps, mapDispatchToProps)(SuggestionComponent);
