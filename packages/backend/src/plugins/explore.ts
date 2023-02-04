import {
  createRouter,
  StaticExploreToolProvider,
} from '@backstage/plugin-explore-backend';
import {ExploreTool} from '@backstage/plugin-explore-common';
import {Router} from 'express';
import {PluginEnvironment} from '../types';

// List of tools you want to surface in the Explore plugin "Tools" page.
const exploreTools: ExploreTool[] = [
  /*  {
      title: 'New Relic',
      description: 'new relic plugin',
      url: '/newrelic',
      image: 'https://i.imgur.com/L37ikrX.jpg',
      tags: ['newrelic', 'proxy', 'nerdGraph'],
    },
    */
];

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    toolProvider: StaticExploreToolProvider.fromData(exploreTools),
  });
}
