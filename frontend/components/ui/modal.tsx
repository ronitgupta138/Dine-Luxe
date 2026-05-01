import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ModalProps = {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
	footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-6 backdrop-blur">
			<div className="w-full max-w-lg rounded-3xl border border-ink/10 bg-paper p-6 shadow-soft">
				<div className="flex items-start justify-between gap-4">
					{title && <h3 className="font-display text-xl text-ink">{title}</h3>}
					<button
						type="button"
						onClick={onClose}
						className={cn('rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink')}
					>
						Close
					</button>
				</div>
				<div className="mt-4">{children}</div>
				{footer && <div className="mt-6">{footer}</div>}
			</div>
		</div>
	)
}
