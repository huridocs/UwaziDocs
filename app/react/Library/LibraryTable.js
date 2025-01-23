import React from 'react';
import { TableViewer } from 'app/Layout/TableViewer';
import { LibraryRootComponent } from 'app/Library/Library';
import LibraryLayout from 'app/Library/LibraryLayout';
import DocumentsList from 'app/Library/components/DocumentsList';
import { requestState } from 'app/Library/helpers/requestState';
import { withRouter } from 'app/componentWrappers';
import { trackPage } from 'app/App/GoogleAnalytics';

class LibraryTableComponent extends LibraryRootComponent {
  static async requestState(requestParams, globalResources) {
    return requestState(requestParams, globalResources, { calculateTableColumns: true });
  }

  componentWillUnmount() {
    // override unmount behavior to avoid race condition with requestState.
    // the race condition is a conflict with react-router and our RouterHandler class components.
  }

  render() {
    trackPage();
    return (
      <LibraryLayout sidePanelMode="unpinned-mode">
        <DocumentsList
          storeKey="library"
          CollectionViewer={TableViewer}
          zoomIn={this.zoomIn}
          zoomOut={this.zoomOut}
          scrollCount={this.state.scrollCount}
          tableViewMode
        />
      </LibraryLayout>
    );
  }
}

const SSRLibraryComponent = withRouter(LibraryTableComponent);

const LibraryTable = Object.assign(SSRLibraryComponent, {
  requestState: LibraryTableComponent.requestState,
});

export { LibraryTableComponent };
export { LibraryTable };
