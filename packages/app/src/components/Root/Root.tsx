import React, { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import MapIcon from '@material-ui/icons/MyLocation';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import BuildIcon from '@material-ui/icons/Build';
import CenterFocusIcon from '@material-ui/icons/CenterFocusWeakRounded';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import {catalogEntityCreatePermission} from "@backstage/plugin-catalog-common/alpha";
import {usePermission} from "@backstage/plugin-permission-react";
import {costInsightsReadPermission} from "../../permissions/permissions";


const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};



export const Root = ({ children }: PropsWithChildren<{}>) => {
  const { allowed: entityCreationAllowed } = usePermission({
    permission: catalogEntityCreatePermission,
  });
  const { allowed: costInsightsAllowed } = usePermission({
    permission: costInsightsReadPermission
  })
  return (<SidebarPage>
      <Sidebar>
        <SidebarLogo/>
        <SidebarGroup label="Search" icon={<SearchIcon/>} to="/search">
          <SidebarSearchModal/>
        </SidebarGroup>
        <SidebarDivider/>
        <SidebarGroup label="Menu" icon={<MenuIcon/>}>
          {/* Global nav, not org-specific */}
          <SidebarItem icon={HomeIcon} to="catalog" text="Home"/>
          <SidebarItem icon={CenterFocusIcon} to="explore" text="Explore"/>
          <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs"/>
          <SidebarItem icon={LibraryBooks} to="docs" text="Docs"/>
          {entityCreationAllowed && (<SidebarItem icon={CreateComponentIcon} to="create" text="Create..."/>)}
          <SidebarDivider/>
          {/* End global nav */}

          <SidebarScrollWrapper>
            <SidebarItem icon={BuildIcon} to="toolbox" text="ToolBox"/>
            <SidebarItem icon={MapIcon} to="tech-radar" text="Tech Radar"/>
            {costInsightsAllowed && (<SidebarItem icon={MoneyIcon} to="cost-insights" text="Cost Insights"/>)}
          </SidebarScrollWrapper>
        </SidebarGroup>
        <SidebarSpace/>
        <SidebarDivider/>
        <SidebarGroup
          label="Settings"
          icon={<UserSettingsSignInAvatar/>}
          to="/settings"
        >
          <SidebarSettings/>
        </SidebarGroup>
      </Sidebar>
      {children}
    </SidebarPage>
  );
}
