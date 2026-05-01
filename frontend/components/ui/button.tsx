import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant
	size?: ButtonSize
}

const baseStyles =
	'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60'

const variantStyles: Record<ButtonVariant, string> = {
	primary: 'bg-ink text-paper shadow-soft hover:-translate-y-0.5',
	secondary: 'bg-accent text-paper shadow-soft hover:-translate-y-0.5',
	outline: 'border border-ink/15 bg-paper/80 text-ink hover:border-ink/30',
	ghost: 'bg-transparent text-ink hover:bg-ink/5',
}

const sizeStyles: Record<ButtonSize, string> = {
	sm: 'h-8 px-4 text-xs',
	md: 'h-10 px-5',
	lg: 'h-12 px-6 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', ...props }, ref) => (
		<button
			ref={ref}
			className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
			{...props}
		/>
	),
)

Button.displayName = 'Button'
