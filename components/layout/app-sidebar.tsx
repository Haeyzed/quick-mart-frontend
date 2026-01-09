"use client"

import { useLayout } from '@/context/layout-provider'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user: authUser } = useAuth()

  // Map auth user to sidebar user format
  const user = authUser
    ? {
        name: authUser.name || 'User',
        email: authUser.email || 'No email',
        avatar: authUser.image || '/avatars/shadcn.jpg',
      }
    : {
        name: 'User',
        email: 'No email',
        avatar: '/avatars/shadcn.jpg',
      }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
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

