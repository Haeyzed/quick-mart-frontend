"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

type CSVPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: string[][]
  onConfirm: () => void
  isImporting?: boolean
  title?: string
}

export function CSVPreviewDialog({
  open,
  onOpenChange,
  data,
  onConfirm,
  isImporting = false,
  title = 'Preview Import Data',
}: CSVPreviewDialogProps) {
  if (data.length === 0) return null

  const headers = data[0] || []
  const rows = data.slice(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className='sm:max-w-4xl max-h-[80vh] flex flex-col' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Review the data below before importing. {rows.length} row{rows.length !== 1 ? 's' : ''} will be imported.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='flex-1 border rounded-md'>
          <Table>
            <TableHeader className='sticky top-0 bg-background z-10'>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className='font-semibold'>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      {row[colIndex] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Confirm Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

