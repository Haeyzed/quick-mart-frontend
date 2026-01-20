"use client"

import { useLayout } from '@/context/layout-provider'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { filterSidebarByPermissions } from '@/lib/utils/sidebar-permissions'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useMemo } from 'react'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user: authUser } = useAuth()
  const { permissions } = usePermissions()

  // Filter sidebar data based on user permissions
  const filteredSidebarData = useMemo(() => {
    return filterSidebarByPermissions(sidebarData, permissions)
  }, [permissions])

  // Map auth user to sidebar user format
  const user = authUser
    ? {
        name: authUser.name || 'User',
        email: authUser.email || 'No email',
        avatar: authUser.avatar_url || '/avatars/shadcn.jpg',
      }
    : {
        name: 'User',
        email: 'No email',
        avatar: '/avatars/shadcn.jpg',
      }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={filteredSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

