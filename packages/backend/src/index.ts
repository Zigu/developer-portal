
import Router from 'express-promise-router';
import {
  createServiceBuilder,
  loadBackendConfig,
  getRootLogger,
  useHotMemoize,
  notFoundHandler,
  CacheManager,
  DatabaseManager,
  SingleHostDiscovery,
  UrlReaders,
  ServerTokenManager,
} from '@backstage/backend-common';
import { TaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import app from './plugins/app';
import auth from './plugins/auth';
import catalog from './plugins/catalog';
import scaffolder from './plugins/scaffolder';
import proxy from './plugins/proxy';
import techdocs from './plugins/techdocs';
import search from './plugins/search';
import explore from './plugins/explore';
import permission from './plugins/permissions';
import playlist from './plugins/playlist';
import ccfp from './plugins/ccfp';
import todo from './plugins/todo';
import entityFeedback from './plugins/entityFeedback';
import linguist from './plugins/linguist';
import gitlab from './plugins/gitlab';
import techInsights from './plugins/techInsights';
import { PluginEnvironment } from './types';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  const discovery = SingleHostDiscovery.fromConfig(config);
  const cacheManager = CacheManager.fromConfig(config);
  const databaseManager = DatabaseManager.fromConfig(config, { logger: root });
  // const tokenManager = ServerTokenManager.noop();
  const tokenManager = ServerTokenManager.fromConfig(config, { logger: root });
  const taskScheduler = TaskScheduler.fromConfig(config);

  const identity = DefaultIdentityClient.create({
    discovery,
  });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });

  root.info(`Created UrlReader ${reader}`);

  return (plugin: string): PluginEnvironment => {
    const logger = root.child({ type: 'plugin', plugin });
    const database = databaseManager.forPlugin(plugin);
    const cache = cacheManager.forPlugin(plugin);
    const scheduler = taskScheduler.forPlugin(plugin);
    return {
      logger,
      database,
      cache,
      config,
      reader,
      discovery,
      tokenManager,
      scheduler,
      permissions,
      identity,
    };
  };
}

async function main() {
  const config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const createEnv = makeCreateEnv(config);

  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const scaffolderEnv = useHotMemoize(module, () => createEnv('scaffolder'));
  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
  const techdocsEnv = useHotMemoize(module, () => createEnv('techdocs'));
  const exploreEnv = useHotMemoize(module, () => createEnv('explore'));
  const searchEnv = useHotMemoize(module, () => createEnv('search'));
  const appEnv = useHotMemoize(module, () => createEnv('app'));
  const permissionEnv = useHotMemoize(module, () => createEnv('permission'));
  const playlistEnv = useHotMemoize(module, () => createEnv('playlist'));
  const ccfpEnv = useHotMemoize(module, () => createEnv('cloud-carbon-footprint'),);
  const todoEnv = useHotMemoize(module, () => createEnv('todo'));
  const entityFeedbackEnv = useHotMemoize(module, () => createEnv('entityFeedback'));
  const linguistEnv = useHotMemoize(module, () => createEnv('linguist'));
  const techInsightsEnv = useHotMemoize(module, () => createEnv('tech_insights'));
  const gitlabEnv = useHotMemoize(module, () => createEnv('gitlab'));

  const apiRouter = Router();
  apiRouter.use('/catalog', await catalog(catalogEnv));
  apiRouter.use('/scaffolder', await scaffolder(scaffolderEnv));
  apiRouter.use('/auth', await auth(authEnv));
  apiRouter.use('/techdocs', await techdocs(techdocsEnv));
  apiRouter.use('/proxy', await proxy(proxyEnv));
  apiRouter.use('/search', await search(searchEnv));
  apiRouter.use('/explore', await explore(exploreEnv));
  apiRouter.use('/permission', await permission(permissionEnv));
  apiRouter.use('/playlist', await playlist(playlistEnv));
  apiRouter.use('/cloud-carbon-footprint', await ccfp(ccfpEnv));
  apiRouter.use('/todo', await todo(todoEnv));
  apiRouter.use('/entity-feedback', await entityFeedback(entityFeedbackEnv));
  apiRouter.use('/linguist', await linguist(linguistEnv));
  apiRouter.use('/tech-insights', await techInsights(techInsightsEnv));
  apiRouter.use('/gitlab', await gitlab(gitlabEnv));


  // Add backends ABOVE this line; this 404 handler is the catch-all fallback
  apiRouter.use(notFoundHandler());

  const service = createServiceBuilder(module)
    .loadConfig(config)
    .addRouter('/api', apiRouter)
    .addRouter('', await app(appEnv));

  await service.start().catch(err => {
    console.log(err);
    process.exit(1);
  });
}

module.hot?.accept();
main().catch(error => {
  console.error('Backend failed to start up', error);
  process.exit(1);
});
