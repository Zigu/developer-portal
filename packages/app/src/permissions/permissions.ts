import { createPermission } from '@backstage/plugin-permission-common';

export const costInsightsReadPermission = createPermission({
  name: 'cost-insights.read',
  attributes: {
    action: 'read',
  },
});
