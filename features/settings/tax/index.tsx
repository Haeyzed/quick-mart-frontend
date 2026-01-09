"use client"

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TaxesDialogs } from './components/tax-dialogs'
import { TaxesPrimaryButtons } from './components/tax-primary-buttons'
import { TaxesProvider } from './components/tax-provider'
import { TaxesTable } from './components/tax-table'

export function Taxes() {
  return (
    <TaxesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Tax List</h2>
            <p className='text-muted-foreground'>
              Manage your taxes here.
            </p>
          </div>
          <TaxesPrimaryButtons />
        </div>
        <TaxesTable />
      </Main>

      <TaxesDialogs />
    </TaxesProvider>
  )
}

