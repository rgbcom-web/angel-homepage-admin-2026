'use client';

import { cn } from '@/shared/lib/utils';
import { ChevronsUpDown, LogOut, Shell } from 'lucide-react';

import { Avatar } from '@/shared/shadcn/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/shadcn/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/shadcn/components/ui/sidebar';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/features/auth/AuthSessionProvider';

export function SideNavBarProfile() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {/* <span className="truncate text-xs text-muted-foreground">영업팀</span> */}
                <span className="truncate font-semibold">{user.name} 님</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="px-1.5 py-1.5 pt-3 text-left text-xs">
                <span className="font-semibold text-muted-foreground">My account</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={cn(
                'bg-destructive-light text-destructive hover:!bg-destructive-light hover:!text-destructive-light-foreground hover:opacity-70',
              )}
              onClick={() => signOut()}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserAvatar() {
  return (
    <Avatar className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
      <Shell className="size-4" />
    </Avatar>
  );
}
