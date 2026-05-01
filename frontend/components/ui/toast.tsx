import { cn } from '@/lib/utils'

type ToastProps = {
	title: string
	description?: string
	variant?: 'default' | 'success' | 'warning'
}

const variantClasses: Record<string, string> = {
	default: 'border-ink/10 bg-paper text-ink',
	success: 'border-accent2/30 bg-accent2/10 text-ink',
	warning: 'border-accent/30 bg-accent/10 text-ink',
}

export function Toast({ title, description, variant = 'default' }: ToastProps) {
	return (
		<div className={cn('rounded-2xl border px-4 py-3 shadow-soft', variantClasses[variant])}>
			<p className="text-sm font-semibold">{title}</p>
			{description && <p className="mt-1 text-xs text-muted">{description}</p>}
		</div>
	)
}
