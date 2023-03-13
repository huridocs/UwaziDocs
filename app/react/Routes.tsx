/* eslint-disable max-lines */
import React from 'react';
import { createRoutesFromElements, Route } from 'react-router-dom';
import { App } from 'app/App/App';
import Activitylog from 'app/Activitylog/Activitylog';
import Configure2fa from 'app/Auth2fa/Configure2fa';
import { EditTranslations } from 'app/I18N/EditTranslations';
import { LibraryCards } from 'app/Library/Library';
import { LibraryMap } from 'app/Library/LibraryMap';
import { MetadataExtractionDashboard } from 'app/MetadataExtraction/MetadataExtractionDashboard';
import { EditPage } from 'app/Pages/EditPage';
import NewPage from 'app/Pages/NewPage';
import Pages from 'app/Pages/Pages';
import { EditRelationType } from 'app/RelationTypes/EditRelationType';
import NewRelationType from 'app/RelationTypes/NewRelationType';
import {
  PreserveSettings,
  AccountSettings,
  CollectionSettings,
  Customisation,
  CustomUploads,
  EntityTypesList,
  FiltersForm,
  LanguageList,
  NavlinksSettings,
  RelationTypesList,
  Settings,
  ThesauriList,
  TranslationsList,
  Dashboard,
} from 'app/Settings';
import { EditTemplate } from 'app/Templates/EditTemplate';
import NewTemplate from 'app/Templates/NewTemplate';
import { EditThesauri } from 'app/Thesauri/EditThesauri';
import NewThesauri from 'app/Thesauri/NewThesauri';
import ThesaurusCockpit from 'app/Thesauri/ThesaurusCockpit';
import { Login } from 'app/Users/Login';
import GeneralError from 'app/App/ErrorHandling/GeneralError';
import { UserManagement } from 'app/Users/UserManagement';
import { LibraryTable } from 'app/Library/LibraryTable';
import ViewerRoute from 'app/Viewer/ViewerRoute';
import { Settings as settingsType } from 'shared/types/settingsType';
import { loggedInUsersRoute, adminsOnlyRoute, privateRoute } from './ProtectedRoute';
import { getIndexElement } from './getIndexElement';
import { PageView } from './Pages/PageView';
import { RouteErrorBoundary } from './App/ErrorHandling/RouteErrorBoundary';
import ResetPassword from './Users/ResetPassword';
import UnlockAccount from './Users/UnlockAccount';
import { IXSuggestions, IXSuggestionsLoader } from './MetadataExtraction/SuggestionsContainer';
import OneUpReview from './Review/OneUpReview';
import { IncomingHttpHeaders } from 'http';

const getRoutesLayout = (
  settings: settingsType | undefined,
  indexElement: React.ReactNode,
  headers?: IncomingHttpHeaders
) => (
  <Route errorElement={<RouteErrorBoundary />}>
    <Route index element={indexElement} />
    <Route path="login" element={<Login />} />
    <Route path="library" element={privateRoute(<LibraryCards />, settings)} />
    <Route path="library/map" element={privateRoute(<LibraryMap />, settings)} />
    <Route path="library/table" element={privateRoute(<LibraryTable />, settings)} />
    <Route path="document/:sharedId/*" element={privateRoute(<ViewerRoute />, settings)} />
    <Route path="entity/:sharedId/*" element={privateRoute(<ViewerRoute />, settings)} />
    <Route path="entity/:sharedId/:tabView" element={privateRoute(<ViewerRoute />, settings)} />
    <Route path="error/:errorCode" element={<GeneralError />} />
    <Route path="404" element={<GeneralError />} />
    <Route path="page/:sharedId" element={<PageView />} />
    <Route path="page/:sharedId/:slug" element={<PageView />} />
    <Route path="setpassword/:key" element={<ResetPassword />} />
    <Route path="unlockaccount/:username/:code" element={<UnlockAccount />} />
    <Route path="review" element={adminsOnlyRoute(<OneUpReview />)} />
    <Route path="settings" element={loggedInUsersRoute(<Settings />)}>
      <Route path="account" element={<AccountSettings />} />
      <Route path="dashboard" element={adminsOnlyRoute(<Dashboard />)} />
      <Route path="2fa" element={adminsOnlyRoute(<Configure2fa />)} />
      <Route path="collection" element={adminsOnlyRoute(<CollectionSettings />)} />
      <Route path="navlinks" element={adminsOnlyRoute(<NavlinksSettings />)} />
      <Route path="users" element={adminsOnlyRoute(<UserManagement />)} />
      <Route path="preserve" element={adminsOnlyRoute(<PreserveSettings />)} />
      <Route path="pages">
        <Route index element={adminsOnlyRoute(<Pages />)} />
        <Route path="new" element={adminsOnlyRoute(<NewPage />)} />
        <Route path="edit/:sharedId" element={adminsOnlyRoute(<EditPage />)} />
      </Route>
      <Route path="templates">
        <Route index element={adminsOnlyRoute(<EntityTypesList />)} />
        <Route path="new" element={adminsOnlyRoute(<NewTemplate />)} />
        <Route path="edit/:templateId" element={adminsOnlyRoute(<EditTemplate />)} />
      </Route>
      <Route
        path="metadata_extraction"
        element={adminsOnlyRoute(<MetadataExtractionDashboard />)}
      />
      <Route
        path="metadata_extraction/suggestions/:extractorId"
        loader={IXSuggestionsLoader(headers)}
        element={adminsOnlyRoute(<IXSuggestions />)}
      />
      <Route path="connections">
        <Route index element={adminsOnlyRoute(<RelationTypesList />)} />
        <Route path="new" element={adminsOnlyRoute(<NewRelationType />)} />
        <Route path="edit/:_id" element={adminsOnlyRoute(<EditRelationType />)} />
      </Route>
      <Route path="dictionaries">
        <Route index element={adminsOnlyRoute(<ThesauriList />)} />
        <Route path="new" element={adminsOnlyRoute(<NewThesauri />)} />
        <Route path="edit/:_id" element={adminsOnlyRoute(<EditThesauri />)} />
        <Route path="cockpit/:_id" element={adminsOnlyRoute(<ThesaurusCockpit />)} />
      </Route>
      <Route path="languages" element={adminsOnlyRoute(<LanguageList />)} />
      <Route path="translations">
        <Route index element={adminsOnlyRoute(<TranslationsList />)} />
        <Route path="edit/:context" element={adminsOnlyRoute(<EditTranslations />)} />
      </Route>
      <Route path="filters" element={adminsOnlyRoute(<FiltersForm />)} />
      <Route path="customisation" element={adminsOnlyRoute(<Customisation />)} />
      <Route path="custom-uploads" element={adminsOnlyRoute(<CustomUploads />)} />
      <Route path="activitylog" element={adminsOnlyRoute(<Activitylog />)} />
    </Route>
  </Route>
);

const getRoutes = (
  settings: settingsType | undefined,
  userId: string | undefined,
  headers?: IncomingHttpHeaders
) => {
  const { element, parameters } = getIndexElement(settings, userId);
  const layout = getRoutesLayout(settings, element, headers);
  return createRoutesFromElements(
    <Route path="/" element={<App customParams={parameters} />}>
      {layout}
      <Route path=":lang">
        {layout}
        <Route path="*" element={<GeneralError />} />
      </Route>
      <Route path="*" element={<GeneralError />} />
    </Route>
  );
};

export { getRoutes };
