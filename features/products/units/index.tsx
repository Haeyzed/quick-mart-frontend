"use client"

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UnitsDialogs } from './components/units-dialogs'
import { UnitsPrimaryButtons } from './components/units-primary-buttons'
import { UnitsProvider } from './components/units-provider'
import { UnitsTable } from './components/units-table'

export function Units() {
  return (
    <UnitsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Unit List</h2>
            <p className='text-muted-foreground'>
              Manage your product units here.
            </p>
          </div>
          <UnitsPrimaryButtons />
        </div>
        <UnitsTable />
      </Main>

      <UnitsDialogs />
    </UnitsProvider>
  )
}

