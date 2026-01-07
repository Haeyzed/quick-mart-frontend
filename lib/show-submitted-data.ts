import { toast } from 'sonner'
import React from 'react'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: React.createElement(
      'pre',
      { className: 'mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4' },
      React.createElement(
        'code',
        { className: 'text-white' },
        JSON.stringify(data, null, 2)
      )
    ),
  })
}

