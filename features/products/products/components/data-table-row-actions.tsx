"use client"

import { MoreHorizontalIcon, Delete01Icon, EditIcon, EyeIcon } from '@hugeicons/core-free-icons'
import { type Row } from '@tanstack/react-table'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Product } from '../data/schema'
import { useProducts } from './products-provider'
import { useDeleteProduct } from '../api/use-products'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type DataTableRowActionsProps = {
  row: Row<Product>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const { setCurrentRow } = useProducts()
  const deleteProduct = useDeleteProduct()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(row.original.id)
      toast.success('Product deleted successfully')
      setDeleteDialogOpen(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              router.push(`/products/${row.original.id}`)
            }}
          >
            View
            <DropdownMenuShortcut>
              <HugeiconsIcon icon={EyeIcon} size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              router.push(`/products/${row.original.id}/edit`)
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <HugeiconsIcon icon={EditIcon} size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setDeleteDialogOpen(true)
            }}
            className='text-red-500!'
          >
            Delete
            <DropdownMenuShortcut>
              <HugeiconsIcon icon={Delete01Icon} size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the product &quot;{row.original.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

