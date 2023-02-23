import React from 'react';
import {Route} from 'react-router';
import {apiDocsPlugin, ApiExplorerPage} from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import {ScaffolderPage, scaffolderPlugin} from '@backstage/plugin-scaffolder';
import {orgPlugin} from '@backstage/plugin-org';
import {SearchPage} from '@backstage/plugin-search';
import {TechRadarPage} from '@backstage/plugin-tech-radar';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import {TechDocsAddons} from '@backstage/plugin-techdocs-react';
import {ReportIssue} from '@backstage/plugin-techdocs-module-addons-contrib';
import {UserSettingsPage} from '@backstage/plugin-user-settings';
import {apis} from './apis';
import {entityPage} from './components/catalog/EntityPage';
import {searchPage} from './components/search/SearchPage';
import {Root} from './components/Root';

import {AlertDisplay, OAuthRequestDialog} from '@backstage/core-components';
import {createApp} from '@backstage/app-defaults';
import {FlatRoutes} from '@backstage/core-app-api';
import {CatalogGraphPage} from '@backstage/plugin-catalog-graph';
import {RequirePermission} from '@backstage/plugin-permission-react';
import {catalogEntityCreatePermission} from '@backstage/plugin-catalog-common/alpha';

import {keycloakAuthApiRef} from './apis';
import {SignInPage} from '@backstage/core-components';

import {ToolboxPage} from '@drodil/backstage-plugin-toolbox';
import {ExplorePage} from '@backstage/plugin-explore';
import {CostInsightsPage} from '@backstage/plugin-cost-insights';
import {costInsightsReadPermission} from "./permissions/permissions";
import {PlaylistIndexPage} from '@backstage/plugin-playlist';
import {shortcutsPlugin} from '@backstage/plugin-shortcuts';
import {HomepageCompositionRoot} from "@backstage/plugin-home";
import {HomePage} from "./components/home/HomePage";
import { CloudCarbonFootprintPage } from '@cloud-carbon-footprint/backstage-plugin-frontend'
import { EntityValidationPage } from '@backstage/plugin-entity-validation';
import { ScoreBoardPage } from './components/scorecard/ScoreBoardPage';

const app = createApp({
  apis,
  components: {
    SignInPage: props => (
      <SignInPage
        {...props}
        auto
        provider={{
          id: 'keycloak-auth-provider',
          title: 'KeyCloak',
          message: 'Sign in using Keycloak',
          apiRef: keycloakAuthApiRef,
        }}
      />
    )
  },
  plugins: [shortcutsPlugin],
  bindRoutes({bind}) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

const AppRouter = app.getRouter();

const routes = (
  <FlatRoutes>
    <Route path="/" element={<HomepageCompositionRoot/>}>
      <HomePage/>
    </Route>;

    <Route path="/catalog" element={<CatalogIndexPage/>}/>
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage/>}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage/>}/>
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage/>}
    >
      <TechDocsAddons>
        <ReportIssue/>
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={
      <RequirePermission permission={catalogEntityCreatePermission}>
        <ScaffolderPage/>
      </RequirePermission>
    }/>
    <Route path="/api-docs" element={<ApiExplorerPage/>}/>
    <Route
      path="/tech-radar"
      element={<TechRadarPage width={1500} height={800}/>}
    />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage/>
        </RequirePermission>
      }/>
    <Route path="/search" element={<SearchPage/>}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage/>}/>
    <Route path="/catalog-graph" element={<CatalogGraphPage/>}/>
    <Route path="/entity-validation" element={<EntityValidationPage />} />
    <Route path="/toolbox" element={<ToolboxPage/>}/>
    <Route path="/explore" element={<ExplorePage/>}/>
    <Route path="/cost-insights" element={
      <RequirePermission permission={costInsightsReadPermission}>
        <CostInsightsPage/>
      </RequirePermission>
    }/>
    <Route path="/playlist" element={<PlaylistIndexPage/>}/>
    <Route path="/cloud-carbon-footprint" element={<CloudCarbonFootprintPage />} />
    <Route path="/score-board" element={<ScoreBoardPage />} />
  </FlatRoutes>
);


export default app.createRoot(
  <>
    <AlertDisplay/>
    <OAuthRequestDialog/>
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>
);
