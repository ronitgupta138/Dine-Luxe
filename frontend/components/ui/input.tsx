import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
	<input
		ref={ref}
		className={cn(
			'h-11 w-full rounded-2xl border border-ink/10 bg-paper/90 px-4 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20',
			className,
		)}
		{...props}
	/>
))

Input.displayName = 'Input'
