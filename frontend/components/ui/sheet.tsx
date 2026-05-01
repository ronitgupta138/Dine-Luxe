import type { ReactNode } from 'react'

type SheetProps = {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 backdrop-blur">
			<div className="w-full max-w-lg rounded-t-3xl border border-ink/10 bg-paper p-6 shadow-soft">
				<div className="flex items-center justify-between">
					{title && <h3 className="font-display text-xl text-ink">{title}</h3>}
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink"
					>
						Close
					</button>
				</div>
				<div className="mt-4">{children}</div>
			</div>
		</div>
	)
}
