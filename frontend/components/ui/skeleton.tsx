import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'animate-pulse rounded-2xl bg-gradient-to-r from-ink/5 via-ink/15 to-ink/5',
				className,
			)}
		/>
	)
}
