import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import {ScoreCardTable} from "@oriflame/backstage-plugin-score-card";

type ScoreBoardPageProps = {
  title?: string;
  subTitle?: string;
  tableTitle?: string;
  entityKindFilter?: string[];
};

export const ScoreBoardPage = ({
                                 title,
                                 subTitle,
                                 tableTitle,
                                 entityKindFilter,
                               }: ScoreBoardPageProps) => (
  <Page themeId="tool">
    <Header
      title={title ?? 'Score board'}
      subtitle={subTitle ?? 'Overview of entity scores'}
    >
    </Header>
    <Content>
      <ContentHeader title="">
        <SupportButton>
          In this table you may see overview of entity scores.
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <ScoreCardTable
            title={tableTitle}
            entityKindFilter={entityKindFilter}
          />
        </Grid>
      </Grid>
    </Content>
  </Page>
);
