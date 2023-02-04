/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  This is a copy-pastable client template to get up and running quickly.
  API Reference:
  https://github.com/backstage/backstage/blob/master/plugins/cost-insights/src/api/CostInsightsApi.ts
*/

// IMPORTANT: Remove the lines below to enable type checking and linting
// @ts-nocheck
/* eslint-disable import/no-extraneous-dependencies */

import { DateTime, Duration as LuxonDuration } from 'luxon';
import regression, { DataPoint } from 'regression';

import {
  CostInsightsApi,
  ProductInsightsOptions,
  Alert,
  Duration,
  DEFAULT_DATE_FORMAT
} from '@backstage/plugin-cost-insights';

import {
  Cost,
  Entity,
  Group,
  MetricData,
  Project,
  DateAggregation,
  Trendline,
  ChangeStatistic
} from '@backstage/plugin-cost-insights-common'

import {CatalogApi} from "@backstage/plugin-catalog-react";
import {DEFAULT_NAMESPACE} from "@backstage/catalog-model";


export const getGroupedProducts = (intervals: string) => [
  {
    id: 'Cloud Dataflow',
    aggregation: aggregationFor(intervals, 1_700),
  },
  {
    id: 'Compute Engine',
    aggregation: aggregationFor(intervals, 350),
  },
  {
    id: 'Cloud Storage',
    aggregation: aggregationFor(intervals, 1_300),
  },
  {
    id: 'BigQuery',
    aggregation: aggregationFor(intervals, 2_000),
  },
  {
    id: 'Cloud SQL',
    aggregation: aggregationFor(intervals, 750),
  },
  {
    id: 'Cloud Spanner',
    aggregation: aggregationFor(intervals, 50),
  },
  {
    id: 'Cloud Pub/Sub',
    aggregation: aggregationFor(intervals, 1_000),
  },
  {
    id: 'Cloud Bigtable',
    aggregation: aggregationFor(intervals, 250),
  },
];

export const getGroupedProjects = (intervals: string) => [
  {
    id: 'project-a',
    aggregation: aggregationFor(intervals, 1_700),
  },
  {
    id: 'project-b',
    aggregation: aggregationFor(intervals, 350),
  },
  {
    id: 'project-c',
    aggregation: aggregationFor(intervals, 1_300),
  },
];

export function changeOf(aggregation: DateAggregation[]): ChangeStatistic {
  const firstAmount = aggregation.length ? aggregation[0].amount : 0;
  const lastAmount = aggregation.length
    ? aggregation[aggregation.length - 1].amount
    : 0;

  // if either the first or last amounts are zero, the rate of increase/decrease is infinite
  if (!firstAmount || !lastAmount) {
    return {
      amount: lastAmount - firstAmount,
    };
  }

  return {
    ratio: (lastAmount - firstAmount) / firstAmount,
    amount: lastAmount - firstAmount,
  };
}

export function trendlineOf(aggregation: DateAggregation[]): Trendline {
  const data: ReadonlyArray<DataPoint> = aggregation.map(a => [
    Date.parse(a.date) / 1000,
    a.amount,
  ]);
  const result = regression.linear(data, { precision: 5 });
  return {
    slope: result.equation[0],
    intercept: result.equation[1],
  };
}

export function aggregationFor(
  intervals: string,
  baseline: number,
): DateAggregation[] {
  const { duration, endDate } = parseIntervals(intervals);
  const inclusiveEndDate = inclusiveEndDateOf(duration, endDate);
  const days = DateTime.fromISO(endDate).diff(
    DateTime.fromISO(inclusiveStartDateOf(duration, inclusiveEndDate)),
    'days',
  ).days;

  function nextDelta(): number {
    const varianceFromBaseline = 0.15;
    // Let's give positive vibes in trendlines - higher change for positive delta with >0.5 value
    const positiveTrendChance = 0.55;
    const normalization = positiveTrendChance - 1;
    return baseline * (Math.random() + normalization) * varianceFromBaseline;
  }

  return [...Array(days).keys()].reduce(
    (values: DateAggregation[], i: number): DateAggregation[] => {
      const last = values.length ? values[values.length - 1].amount : baseline;
      const date = DateTime.fromISO(
        inclusiveStartDateOf(duration, inclusiveEndDate),
      )
        .plus({ days: i })
        .toFormat(DEFAULT_DATE_FORMAT);
      const amount = Math.max(0, last + nextDelta());
      values.push({
        date: date,
        amount: amount,
      });
      return values;
    },
    [],
  );
}

function parseIntervals(intervals: string): IntervalFields {
  const match = intervals.match(
    /\/(?<duration>P\d+[DM])\/(?<date>\d{4}-\d{2}-\d{2})/,
  );
  if (Object.keys(match?.groups || {}).length !== 2) {
    throw new Error(`Invalid intervals: ${intervals}`);
  }
  const { duration, date } = match!.groups!;
  return {
    duration: duration as Duration,
    endDate: date,
  };
}

export function inclusiveStartDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(inclusiveEndDate)
        .startOf('quarter')
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    default:
      return assertNever(duration);
  }
}



export function inclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  return DateTime.fromISO(exclusiveEndDateOf(duration, inclusiveEndDate))
    .minus({ days: 1 })
    .toFormat(DEFAULT_DATE_FORMAT);
}


export function exclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
): string {
  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(quarterEndDate(inclusiveEndDate))
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    default:
      return assertNever(duration);
  }
}

// Partially copied from https://github.com/backstage/backstage/blob/master/plugins/cost-insights/src/example/client.ts
export class CostInsightsClient implements CostInsightsApi {

  private request(_: any, res: any): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 0, res));
  }

  private readonly catalogApi: CatalogApi;

  constructor(options: {
    catalogApi: CatalogApi;
  }) {
    this.catalogApi = options.catalogApi;
  }

  async getLastCompleteBillingDate(): Promise<string> {
    return Promise.resolve(
      DateTime.now().minus({ days: 1 }).toFormat(DEFAULT_DATE_FORMAT),
    );
  }

  async getUserGroups(userId: string): Promise<Group[]> {

    const ref = `user:${DEFAULT_NAMESPACE}/${userId}`
    const entities = await this.catalogApi.getEntities({
      filter: {
        kind: ['Group'],
        'relations.hasMember': ref,
      },
      fields: ['metadata']
    });

    const groups = entities.items.map(entity => {
      return {
        id: entity.metadata.name,
        name: entity.metadata.title || entity.metadata.name
      }
    });

    return groups;
  }

  async getGroupProjects(group: string): Promise<Project[]> {
    /*
    const projects: Project[] = await this.request({ group }, [
      { id: 'project-a' },
      { id: 'project-b' },
      { id: 'project-c' },
    ]);

    return projects;

     */
    return []
  }

  async getAlerts(group: string): Promise<Alert[]> {
    /*
    const projectGrowthData: ProjectGrowthData = {
      project: 'example-project',
      periodStart: '2020-Q2',
      periodEnd: '2020-Q3',
      aggregation: [60_000, 120_000],
      change: {
        ratio: 1,
        amount: 60_000,
      },
      products: [
        { id: 'Compute Engine', aggregation: [58_000, 118_000] },
        { id: 'Cloud Dataflow', aggregation: [1200, 1500] },
        { id: 'Cloud Storage', aggregation: [800, 500] },
      ],
    };

    const unlabeledDataflowData: UnlabeledDataflowData = {
      periodStart: '2020-09-01',
      periodEnd: '2020-09-30',
      labeledCost: 6_200,
      unlabeledCost: 7_000,
      projects: [
        {
          id: 'example-project-1',
          unlabeledCost: 5_000,
          labeledCost: 3_000,
        },
        {
          id: 'example-project-2',
          unlabeledCost: 2_000,
          labeledCost: 3_200,
        },
      ],
    };

    const today = DateTime.now();
    const alerts: Alert[] = await this.request({ group }, [
      new ProjectGrowthAlert(projectGrowthData),
      new UnlabeledDataflowAlert(unlabeledDataflowData),
      new KubernetesMigrationAlert(this, {
        startDate: today.minus({ days: 30 }).toFormat(DEFAULT_DATE_FORMAT),
        endDate: today.toFormat(DEFAULT_DATE_FORMAT),
        change: {
          ratio: 0,
          amount: 0,
        },
        services: [
          {
            id: 'service-a',
            aggregation: [20_000, 10_000],
            change: {
              ratio: -0.5,
              amount: -10_000,
            },
            entities: {},
          },
          {
            id: 'service-b',
            aggregation: [30_000, 15_000],
            change: {
              ratio: -0.5,
              amount: -15_000,
            },
            entities: {},
          },
        ],
      }),
    ]);

    return alerts;
     */
    return []
  }

  async getDailyMetricData(metric: string, intervals: string): Promise<MetricData> {
    const aggregation = aggregationFor(intervals, 100_000).map(entry => ({
      ...entry,
      amount: Math.round(entry.amount),
    }));

    const cost: MetricData = await this.request(
      { metric, intervals },
      {
        format: 'number',
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
      },
    );

    return cost;
  }

  async getGroupDailyCost(group: string, intervals: string): Promise<Cost> {
    const aggregation = aggregationFor(intervals, 8_000);
    const groupDailyCost: Cost = await this.request(
      { group, intervals },
      {
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
        // Optional field providing cost groupings / breakdowns keyed by the type. In this example,
        // daily cost grouped by cloud product OR by project / billing account.
        groupedCosts: {
          product: getGroupedProducts(intervals),
          project: getGroupedProjects(intervals),
        },
      },
    );

    return groupDailyCost;
  }

  async getProjectDailyCost(project: string, intervals: string): Promise<Cost> {
    const aggregation = aggregationFor(intervals, 1_500);
    const projectDailyCost: Cost = await this.request(
      { project, intervals },
      {
        id: 'project-a',
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
        // Optional field providing cost groupings / breakdowns keyed by the type. In this example,
        // daily project cost grouped by cloud product.
        groupedCosts: {
          product: getGroupedProducts(intervals),
        },
      },
    );

    return projectDailyCost;
  }

  async getCatalogEntityDailyCost(catalogEntityRef: string, intervals: string): Promise<Cost> {
    const aggregation = aggregationFor(intervals, 8_000);
    const groupDailyCost: Cost = await this.request(
      { entityRef, intervals },
      {
        aggregation: aggregation,
        change: changeOf(aggregation),
        trendline: trendlineOf(aggregation),
        // Optional field providing cost groupings / breakdowns keyed by the type. In this example,
        // daily cost grouped by cloud product OR by project / billing account.
        groupedCosts: {
          product: getGroupedProducts(intervals),
          project: getGroupedProjects(intervals),
        },
      },
    );

    return groupDailyCost;
  }

  async getProductInsights(options: ProductInsightsOptions): Promise<Entity> {
    /*
    const productInsights: Entity = await this.request(
      options,
      entityOf(options.product),
    );

    return productInsights;*

     */

    return []
  }
}
