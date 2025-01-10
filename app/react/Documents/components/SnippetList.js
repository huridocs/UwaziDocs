/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { I18NLink } from 'app/I18N';
import { t } from 'V2/i18n';
import SafeHTML from 'app/utils/SafeHTML';
import getFieldLabel from 'app/Templates/utils/getFieldLabel';
import Immutable from 'immutable';

const MetadataFieldSnippets = ({ fieldSnippets, documentViewUrl, template, searchTerm = '' }) => (
  <>
    <li className="snippet-list-item-header metadata-snippet-header">
      <I18NLink to={`${documentViewUrl}?searchTerm=${searchTerm}`}>
        {getFieldLabel(fieldSnippets.get('field'), template)}
      </I18NLink>
    </li>
    {fieldSnippets.get('texts').map((snippet, index) => (
      <li key={index} className="snippet-list-item metadata-snippet">
        <span>
          <SafeHTML>{snippet}</SafeHTML>
        </span>
      </li>
    ))}
  </>
);

MetadataFieldSnippets.propTypes = {
  fieldSnippets: PropTypes.instanceOf(Immutable.Map).isRequired,
  documentViewUrl: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
  template: PropTypes.shape({
    get: PropTypes.func,
  }),
};

const DocumentContentSnippets = ({
  selectSnippet,
  documentSnippets,
  documentViewUrl,
  searchTerm,
  selectedSnippet,
}) => (
  <>
    <li className="snippet-list-item-header fulltext-snippet-header">
      {t('System', 'Document contents')}
    </li>
    {documentSnippets.map((snippet, index) => {
      const selected = snippet.get('text') === selectedSnippet.get('text') ? 'selected' : '';
      const filename = snippet.get('filename');
      const page = snippet.get('page');
      return (
        <li key={index} className={`snippet-list-item fulltext-snippet ${selected}`}>
          <I18NLink
            onClick={() => selectSnippet(page, snippet)}
            to={`${documentViewUrl}?page=${page}&searchTerm=${searchTerm || ''}${filename ? `&file=${filename}` : ''}`}
          >
            <span className="page-number">{page}</span>
            <span className="snippet-text">
              <SafeHTML>{snippet.get('text')}</SafeHTML>
            </span>
          </I18NLink>
        </li>
      );
    })}
  </>
);

DocumentContentSnippets.propTypes = {
  selectSnippet: PropTypes.func.isRequired,
  documentSnippets: PropTypes.shape({
    map: PropTypes.func,
  }).isRequired,
  selectedSnippet: PropTypes.shape({
    get: PropTypes.func,
  }).isRequired,
  documentViewUrl: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

const SnippetList = ({
  snippets,
  documentViewUrl,
  searchTerm,
  selectSnippet,
  template,
  selectedSnippet,
}) => (
  <ul className="snippet-list">
    {snippets.get('metadata').map(fieldSnippets => (
      <MetadataFieldSnippets
        key={fieldSnippets.get('field')}
        fieldSnippets={fieldSnippets}
        template={template}
        documentViewUrl={documentViewUrl}
        searchTerm={searchTerm}
      />
    ))}
    {snippets.get('fullText').size ? (
      <DocumentContentSnippets
        documentSnippets={snippets.get('fullText')}
        documentViewUrl={documentViewUrl}
        selectSnippet={selectSnippet}
        selectedSnippet={selectedSnippet}
        searchTerm={searchTerm}
      />
    ) : (
      ''
    )}
  </ul>
);

SnippetList.propTypes = {
  documentViewUrl: PropTypes.string.isRequired,
  selectSnippet: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedSnippet: PropTypes.shape({
    get: PropTypes.func,
  }).isRequired,
  snippets: PropTypes.shape({
    get: PropTypes.func,
  }).isRequired,
  template: PropTypes.shape({
    get: PropTypes.func,
  }),
};

const mapStateToProps = (state, ownProps) => ({
  template: state.templates.find(tmpl => tmpl.get('_id') === ownProps.doc.get('template')),
  selectedSnippet: state.documentViewer.uiState.get('snippet'),
});

export { DocumentContentSnippets, MetadataFieldSnippets, SnippetList, mapStateToProps };
export default connect(mapStateToProps)(SnippetList);
