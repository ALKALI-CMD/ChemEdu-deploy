import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-base text-slate-950 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
