import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-slate-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
