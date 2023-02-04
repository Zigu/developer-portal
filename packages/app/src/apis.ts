import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  ApiRef,
  BackstageIdentityApi,
  configApiRef,
  createApiFactory, createApiRef, discoveryApiRef, OAuthApi,
  oauthRequestApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import {OAuth2} from "@backstage/core-app-api";
import { costInsightsApiRef } from '@backstage/plugin-cost-insights';
import { CostInsightsClient } from './clients/CostInsightsClient';
import { catalogApiRef } from "@backstage/plugin-catalog-react";



export const keycloakAuthApiRef: ApiRef<
    OAuthApi &
    OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
> = createApiRef({
  id: 'auth.keycloak',
});

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory({
    api: keycloakAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
        OAuth2.create({
          discoveryApi,
          oauthRequestApi,
          provider: {
            id: 'keycloak-provider',
            title: 'Keycloak auth provider',
            icon: () => null,
          },
          environment: configApi.getOptionalString('auth.environment'),
        }),
  }),
  createApiFactory({
    api: costInsightsApiRef,
    deps: {
      catalogApi: catalogApiRef
    },
    factory: ({ catalogApi }) => new CostInsightsClient({ catalogApi }),
  }),
  ScmAuth.createDefaultApiFactory(),
];



