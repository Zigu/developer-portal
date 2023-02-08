import {PermissionPolicy, PolicyQuery} from "@backstage/plugin-permission-node";
import {AuthorizeResult, isPermission, PolicyDecision} from "@backstage/plugin-permission-common";
import {BackstageIdentityResponse} from "@backstage/plugin-auth-node";
import {catalogConditions, createCatalogConditionalDecision} from "@backstage/plugin-catalog-backend/alpha";
import {catalogEntityDeletePermission, catalogEntityCreatePermission} from '@backstage/plugin-catalog-common/alpha';
import {DefaultPlaylistPermissionPolicy, isPlaylistPermission} from '@backstage/plugin-playlist-backend';

export class GlobalPermissionPolicy implements PermissionPolicy {
  private playlistPermissionPolicy = new DefaultPlaylistPermissionPolicy();

  async handle(request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> {
    const isGuest = user === undefined;
    if (isGuest) {
      if (isPermission(request.permission, catalogEntityCreatePermission)) {
        return {
          result: AuthorizeResult.DENY
        }
      }
      if (request.permission.name === 'cost-insights.read') {
        return {
          result: AuthorizeResult.DENY
        }
      }
    }

    if (isPlaylistPermission(request.permission)) {
      return this.playlistPermissionPolicy.handle(request, user);
    }

    if (isPermission(request.permission, catalogEntityDeletePermission)) {
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: user?.identity.ownershipEntityRefs ?? [],
        }),
      );
    }
    return {result: AuthorizeResult.ALLOW};
  }
}
