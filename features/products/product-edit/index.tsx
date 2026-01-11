"use client"

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductForm } from '../products/components/product-form'
import { useParams } from 'next/navigation'

export function ProductEdit() {
  const params = useParams()
  const productId = params?.id ? parseInt(params.id as string) : undefined

  if (!productId) {
    return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='text-center text-destructive'>Invalid product ID</div>
      </Main>
    )
  }

  return (
    <>
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
            <h2 className='text-2xl font-bold tracking-tight'>Edit Product</h2>
            <p className='text-muted-foreground'>
              Update product information. Fill in all required fields marked with *.
            </p>
          </div>
        </div>
        <ProductForm productId={productId} />
      </Main>
    </>
  )
}

