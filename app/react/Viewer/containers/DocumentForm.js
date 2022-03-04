import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, MetadataForm } from 'app/Metadata';
import { actions as relationshipActions } from 'app/Relationships';
import { saveDocument } from '../actions/documentActions';

function mapStateToProps({ documentViewer, templates, thesauris }) {
  return {
    model: 'documentViewer.sidepanel.metadata',
    isEntity: !documentViewer.sidepanel.file,
    templateId: documentViewer.sidepanel.metadata.template,
    templates,
    thesauris,
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      changeTemplate: actions.changeTemplate,
      onSubmit: doc => (disp, state) =>
        saveDocument(doc)(disp, state).then(() => {
          disp(relationshipActions.reloadRelationships(doc.sharedId));
        }),
    },
    dispatch
  );
}
const connected = connect(mapStateToProps, mapDispatchToProps)(MetadataForm);
export { connected as DocumentForm };
