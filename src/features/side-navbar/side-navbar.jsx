'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/shadcn/components/ui/sidebar';

import { SideNavBarHead } from './side-navbar-head';
import { SideNavBarMain } from './side-navbar-main';
import { SideNavBarSettings } from './navbar-settings/side-navbar-settings';
import { SideNavBarProfile } from './side-navbar-profile';

import { useAuth } from '@/features/auth/AuthSessionProvider';

export function SideNavBar({ ...props }) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props} className={cn('z-50')}>
      <SidebarHeader>
        <SideNavBarHead />
      </SidebarHeader>
      <SidebarContent>
        <SideNavBarMain />
      </SidebarContent>
      <SidebarFooter>
        {user.super_admin && <SideNavBarSettings />}
        <SideNavBarProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
