import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {GlobalPermissionPolicy} from "./permissions/GlobalPermissionPolicy";



export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new GlobalPermissionPolicy(),
    identity: env.identity,
  });
}
