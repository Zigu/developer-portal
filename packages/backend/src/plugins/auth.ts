import {
  createRouter,
  providers,
  defaultAuthProviderFactories
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  stringifyEntityRef,
  DEFAULT_NAMESPACE,
} from '@backstage/catalog-model';



export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      // This replaces the default GitHub auth provider with a customized one.
      // The `signIn` option enables sign-in for this provider, using the
      // identity resolution logic that's provided in the `resolver` callback.
      //
      // This particular resolver makes all users share a single "guest" identity.
      // It should only be used for testing and trying out Backstage.
      //
      // If you want to use a production ready resolver you can switch to
      // the one that is commented out below, it looks up a user entity in the
      // catalog using the GitHub username of the authenticated user.
      // That resolver requires you to have user entities populated in the catalog,
      // for example using https://backstage.io/docs/integrations/github/org
      //
      // There are other resolvers to choose from, and you can also create
      // your own, see the auth documentation for more details:
      //
      //   https://backstage.io/docs/auth/identity-resolver
      gitlab: providers.gitlab.create ({
        signIn: {
          resolver(info, ctx) {
            const { result } = info
            const id = result.fullProfile.username
            if (!id) {
              throw new Error('User profile contained no name');
            }
            // const userRef = 'user:default/guest'; // Must be a full entity reference
            // const [localPart, domain] = profile.email?.split('@');
            const userEntity = stringifyEntityRef({
              kind: 'User',
              name: id || 'unknown',
              namespace: DEFAULT_NAMESPACE,
            });
            return ctx.issueToken({
              claims: {
                sub: userEntity, // The user's own identity
                ent: [userEntity], // A list of identities that the user claims ownership through
              },
            });
          },
          // resolver: providers.oauth2.resolvers.usernameMatchingUserEntityName(),
        }
      }),
      'keycloak-provider': providers.oidc.create({
        signIn: {
          resolver(info, ctx) {
            const preferredUsername = info.result.userinfo.preferred_username;
            if (!preferredUsername) {
              throw new Error('User result does not contain preferredUsername.');
            }
            const userEntity = stringifyEntityRef({
              kind: 'User',
              name: preferredUsername || 'unknown',
              namespace: DEFAULT_NAMESPACE
            });
            return ctx.issueToken({
              claims: {
                sub: userEntity, // The user's own identity
                ent: [userEntity], // A list of identities that the user claims ownership through
              },
            });
          },
        },
      }),
    },
  });
}
