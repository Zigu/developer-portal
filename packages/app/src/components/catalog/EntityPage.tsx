import React, {ReactNode, useMemo, useState} from 'react';
import {Button, Grid} from '@material-ui/core';
import {
  EntityApiDefinitionCard,
  EntityConsumedApisCard,
  EntityConsumingComponentsCard,
  EntityHasApisCard,
  EntityProvidedApisCard,
  EntityProvidingComponentsCard,
} from '@backstage/plugin-api-docs';
import {
  EntityAboutCard,
  EntityDependsOnComponentsCard,
  EntityDependsOnResourcesCard,
  EntityHasComponentsCard,
  EntityHasResourcesCard,
  EntityHasSubcomponentsCard,
  EntityHasSystemsCard,
  EntityLayout,
  EntityLinksCard,
  EntitySwitch,
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  isComponentType,
  isKind,
  hasCatalogProcessingErrors,
  isOrphan,
} from '@backstage/plugin-catalog';
import {
  isGithubActionsAvailable,
  EntityGithubActionsContent,
} from '@backstage/plugin-github-actions';
import {
  EntityUserProfileCard,
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
} from '@backstage/plugin-org';
import {EntityTechdocsContent} from '@backstage/plugin-techdocs';
import {EmptyState, InfoCard} from '@backstage/core-components';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';

import {TechDocsAddons} from '@backstage/plugin-techdocs-react';
import {ReportIssue} from '@backstage/plugin-techdocs-module-addons-contrib';

import {EntityPlaylistDialog} from '@backstage/plugin-playlist';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import {EntityTodoContent} from '@backstage/plugin-todo';

import {
  EntityFeedbackResponseContent,
  LikeDislikeButtons,
  EntityLikeDislikeRatingsCard
} from '@backstage/plugin-entity-feedback';

import {EntityLinguistCard} from '@backstage/plugin-linguist';

import {
  isGitlabAvailable,
  EntityGitlabContent,
} from '@immobiliarelabs/backstage-plugin-gitlab';

import { EntityScoreCardContent } from '@oriflame/backstage-plugin-score-card';

const EntityLayoutWrapper = (props: { children?: ReactNode }) => {
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  const extraMenuItems = useMemo(() => {
    return [
      {
        title: 'Add to playlist',
        Icon: PlaylistAddIcon,
        onClick: () => setPlaylistDialogOpen(true),
      },
    ];
  }, []);

  return (
    <>
      <EntityLayout UNSTABLE_extraContextMenuItems={extraMenuItems}>
        {props.children}
      </EntityLayout>
      <EntityPlaylistDialog
        open={playlistDialogOpen}
        onClose={() => setPlaylistDialogOpen(false)}
      />
    </>
  );
};

const techdocsContent = (
  <EntityTechdocsContent>
    <TechDocsAddons>
      <ReportIssue/>
    </TechDocsAddons>
  </EntityTechdocsContent>
);

const cicdContent = (
  // This is an example of how you can implement your company's logic in entity page.
  // You can for example enforce that all components of type 'service' should use GitHubActions
  <EntitySwitch>
    <EntitySwitch.Case if={isGithubActionsAvailable}>
      <EntityGithubActionsContent/>
    </EntitySwitch.Case>
    <EntitySwitch.Case if={isGitlabAvailable}>
      <EntityGitlabContent/>
    </EntitySwitch.Case>

    <EntitySwitch.Case>
      <EmptyState
        title="No CI/CD available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable CI/CD for it. You can read more about annotations in Backstage by clicking the button below."
        action={
          <Button
            variant="contained"
            color="primary"
            href="https://backstage.io/docs/features/software-catalog/well-known-annotations"
          >
            Read more
          </Button>
        }
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid item xs={12}>
          <EntityOrphanWarning/>
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid item xs={12}>
          <EntityProcessingErrorsPanel/>
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem"/>
    </Grid>
    <Grid item md={6}>
      <EntityLinguistCard/>
    </Grid>

    <Grid item md={6} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400}/>
    </Grid>
    <Grid item md={6} xs={10}>
      <EntityLinksCard/>
    </Grid>
    <Grid item md={12} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem"/>
    </Grid>
    <Grid item md={2} xs={2}>
      <InfoCard title="Rate this entity">
        <LikeDislikeButtons/>
      </InfoCard>
    </Grid>
  </Grid>
);

const serviceEntityPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityProvidedApisCard/>
        </Grid>
        <Grid item md={6}>
          <EntityConsumedApisCard/>
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem"/>
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem"/>
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/todo" title="Todo">
      <EntityTodoContent/>
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

const websiteEntityPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem"/>
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem"/>
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/todo" title="Todo">
      <EntityTodoContent/>
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

/**
 * NOTE: This page is designed to work on small screens such as mobile devices.
 * This is based on Material UI Grid. If breakpoints are used, each grid item must set the `xs` prop to a column size or to `true`,
 * since this does not default. If no breakpoints are used, the items will equitably share the available space.
 * https://material-ui.com/components/grid/#basic-grid.
 */

const defaultEntityPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('service')}>
      {serviceEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isComponentType('website')}>
      {websiteEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);

const apiPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard/>
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400}/>
        </Grid>
        <Grid item md={4} xs={12}>
          <EntityLinksCard/>
        </Grid>
        <Grid container item md={12}>
          <Grid item md={6}>
            <EntityProvidingComponentsCard/>
          </Grid>
          <Grid item md={6}>
            <EntityConsumingComponentsCard/>
          </Grid>
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EntityApiDefinitionCard/>
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityUserProfileCard variant="gridItem"/>
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem"/>
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityGroupProfileCard variant="gridItem"/>
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem"/>
        </Grid>
        <Grid item xs={12}>
          <EntityMembersListCard/>
        </Grid>
        <Grid item xs={12}>
          <EntityLikeDislikeRatingsCard/>
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const systemPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem"/>
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400}/>
        </Grid>
        <Grid item md={4} xs={12}>
          <EntityLinksCard/>
        </Grid>
        <Grid item md={8}>
          <EntityHasComponentsCard variant="gridItem"/>
        </Grid>
        <Grid item md={6}>
          <EntityHasApisCard variant="gridItem"/>
        </Grid>
        <Grid item md={6}>
          <EntityHasResourcesCard variant="gridItem"/>
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/diagram" title="Diagram">
      <EntityCatalogGraphCard
        variant="gridItem"
        direction={Direction.TOP_BOTTOM}
        title="System Diagram"
        height={700}
        relations={[
          RELATION_PART_OF,
          RELATION_HAS_PART,
          RELATION_API_CONSUMED_BY,
          RELATION_API_PROVIDED_BY,
          RELATION_CONSUMES_API,
          RELATION_PROVIDES_API,
          RELATION_DEPENDENCY_OF,
          RELATION_DEPENDS_ON,
        ]}
        unidirectional={false}
      />
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
    <EntityLayout.Route path="/score" title="Score">
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12}>
                <EntityScoreCardContent />
              </Grid>
            </Grid>
          </EntityLayout.Route>
  </EntityLayoutWrapper>
);

const domainPage = (
  <EntityLayoutWrapper>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem"/>
        </Grid>
        <Grid item md={6} xs={12}>
          <EntityCatalogGraphCard variant="gridItem" height={400}/>
        </Grid>
        <Grid item md={6}>
          <EntityHasSystemsCard variant="gridItem"/>
        </Grid>
      </Grid>
    </EntityLayout.Route>
    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent/>
    </EntityLayout.Route>
  </EntityLayoutWrapper>
);

export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage}/>
    <EntitySwitch.Case if={isKind('api')} children={apiPage}/>
    <EntitySwitch.Case if={isKind('group')} children={groupPage}/>
    <EntitySwitch.Case if={isKind('user')} children={userPage}/>
    <EntitySwitch.Case if={isKind('system')} children={systemPage}/>
    <EntitySwitch.Case if={isKind('domain')} children={domainPage}/>

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
