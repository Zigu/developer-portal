import React from 'react';
import {IdentityApi, identityApiRef, useApi} from "@backstage/core-plugin-api";
import {CatalogApi, catalogApiRef, EntityProvider} from "@backstage/plugin-catalog-react";
import {useAsync} from "react-use";
import {Content, Header, Page, Progress} from "@backstage/core-components";
import Alert from "@material-ui/lab/Alert"
import {HomePageStarredEntities, HomePageToolkit, WelcomeTitle} from "@backstage/plugin-home";
import Grid from "@material-ui/core/Grid";
import {EntityOwnershipCard} from "@backstage/plugin-org";
import CreateComponentIcon from "@material-ui/icons/AddCircleOutline";
import ViewListIcon from "@material-ui/icons/ViewList"

export const HomePage = () => {
  const identityApi: IdentityApi = useApi(identityApiRef);
  const catalogApi: CatalogApi = useApi(catalogApiRef);


  const response = useAsync(async () => {
    const profile = await identityApi.getBackstageIdentity();
    return await catalogApi.getEntityByRef(profile.userEntityRef);
  }, [identityApi, catalogApi])

  if (response.loading) {
    return <Progress />;
  } else if (response.error) {
    return <Alert severity="error">{response.error.message}</Alert>;
  }

  const user = response.value;

  if (!user) {
    return <Alert severity="error">No user found. Please log in.</Alert>
  }

  return (
    <Page themeId="home">
      <Header title={<WelcomeTitle />} pageTitleOverride="Home" />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <HomePageToolkit title="Getting Started"
                             tools={[
                               { url: '/catalog', label: 'Browse Catalog', icon: <ViewListIcon /> },
                               { url: '/create', label: 'Create new component', icon: <CreateComponentIcon /> }
                             ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <HomePageStarredEntities title="Favourite Entities" />
          </Grid>
          <Grid item xs={12} md={6}>
            <EntityProvider entity={user}>
              <EntityOwnershipCard hideRelationsToggle />
            </EntityProvider>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
