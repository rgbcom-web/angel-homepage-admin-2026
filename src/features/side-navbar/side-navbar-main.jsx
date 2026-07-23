'use client';

import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/shadcn/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/shadcn/components/ui/sidebar';
import { usePathname } from 'next/navigation';

import { menuTree } from './menu-tree';
import { useAuth } from '@/features/auth/AuthSessionProvider';

export function SideNavBarMain() {
  const { user } = useAuth();

  const filteredMenuTree = menuTree
    .filter((menuGroup) => {
      if (menuGroup.permission !== undefined) {
        return menuGroup.permission(user);
      }
      return true;
    })
    .map((menuGroup) => ({
      ...menuGroup,
      items: menuGroup.items.filter((item) => {
        if (item.permission !== undefined) {
          return item.permission(user);
        }
        return true;
      }),
    }));

  return filteredMenuTree.map((menuGroup) => (
    <SidebarGroup key={menuGroup.title} className={cn('py-1')}>
      <SidebarGroupLabel>{menuGroup.title}</SidebarGroupLabel>
      <SidebarMenu>
        {menuGroup.items.map((item) => (
          <MenuItem item={item} key={item.title} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ));
}

function MenuItem({ item }) {
  const pathname = usePathname();
  let isActive = pathname.startsWith(item.url);

  if (item.items) {
    item.items.forEach((subItem) => {
      if (pathname.startsWith(subItem.url)) {
        isActive = true;
      }
    });
  }

  return !item.items ? (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        className={isActive ? 'pointer-events-none text-primary-light-foreground' : ''}
      >
        <Link href={item.url}>
          {item.icon && <item.icon strokeWidth={1.5} />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ) : (
    <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(isActive && 'text-primary-light-foreground')}
          >
            {item.icon && <item.icon strokeWidth={1.5} />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className={cn('pb-2 pr-0 pt-1')}>
            <div className={cn('space-y-1')}>
              {item.items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.url)}>
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </div>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
