import { createRouter } from '@backstage/plugin-entity-feedback-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default function createPlugin(env: PluginEnvironment): Promise<Router> {
  return createRouter({
    database: env.database,
    discovery: env.discovery,
    identity: env.identity,
    logger: env.logger,
  });
}
