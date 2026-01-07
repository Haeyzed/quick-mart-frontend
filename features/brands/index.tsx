"use client"

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BrandsDialogs } from './components/brands-dialogs'
import { BrandsPrimaryButtons } from './components/brands-primary-buttons'
import { BrandsProvider } from './components/brands-provider'
import { BrandsTable } from './components/brands-table'

export function Brands() {
  return (
    <BrandsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Brand List</h2>
            <p className='text-muted-foreground'>
              Manage your product brands here.
            </p>
          </div>
          <BrandsPrimaryButtons />
        </div>
        <BrandsTable />
      </Main>

      <BrandsDialogs />
    </BrandsProvider>
  )
}

