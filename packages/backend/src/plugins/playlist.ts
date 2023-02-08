import { createRouter } from '@backstage/plugin-playlist-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    database: env.database,
    discovery: env.discovery,
    identity: env.identity,
    logger: env.logger,
    permissions: env.permissions,
  });
}
