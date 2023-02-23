import {
  createRouter,
  buildTechInsightsContext,
} from '@backstage/plugin-tech-insights-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { FactRetriever, FactRetrieverContext } from '@backstage/plugin-tech-insights-node';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { createFactRetrieverRegistration } from '@backstage/plugin-tech-insights-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {

  const myFactRetriever: FactRetriever = {
    id: 'documentation-number-factretriever', // unique identifier of the fact retriever
    version: '0.1.1', // SemVer version number of this fact retriever schema. This should be incremented if the implementation changes
    entityFilter: [{ kind: 'component' }], // EntityFilter to be used in the future (creating checks, graphs etc.) to figure out which entities this fact retrieves data for.
    schema: {
      // Name/identifier of an individual fact that this retriever returns
      examplenumberfact: {
        type: 'integer', // Type of the fact
        description: 'A fact of a number', // Description of the fact
      },
    },
    handler: async ({ discovery, entityFilter, tokenManager}: FactRetrieverContext) => {
      // Handler function that retrieves the fact
      const { token } = await tokenManager.getToken();
      const catalogClient = new CatalogClient({
        discoveryApi: discovery,
      });
      const entities = await catalogClient.getEntities(
        {
          filter: entityFilter,
        },
        { token },
      );
      /**
       * snip: Do complex logic to retrieve facts from external system or calculate fact values
       */

      // Respond with an array of entity/fact values
      return entities.items.map((entity: Entity) => {
        return {
          // Entity information that this fact relates to
          entity: {
            namespace: entity.metadata.namespace!,
            kind: entity.kind,
            name: entity.metadata.name,
          },

          // All facts that this retriever returns
          facts: {
            examplenumberfact: 2, //
          },
          // (optional) timestamp to use as a Luxon DateTime object
        };
      });
    },
  };

  const myFactRetrieverRegistration = createFactRetrieverRegistration({
    cadence: '*/2 * * * * ', // On the first minute of the second day of the month
    factRetriever: myFactRetriever,
  });




  const builder = buildTechInsightsContext({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    scheduler: env.scheduler,
    tokenManager: env.tokenManager,
    factRetrievers: [myFactRetrieverRegistration], // Fact retrievers registrations you want tech insights to use
  });

  return await createRouter({
    ...(await builder),
    logger: env.logger,
    config: env.config,
  });
}
