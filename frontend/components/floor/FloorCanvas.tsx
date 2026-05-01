import TableUnit from './TableUnit'

const sampleTables: Array<{ label: string; status: 'free' | 'occupied' | 'reserved' | 'cleaning' }> = [
	{ label: 'A1', status: 'occupied' },
	{ label: 'A2', status: 'free' },
	{ label: 'B1', status: 'reserved' },
	{ label: 'B2', status: 'cleaning' },
	{ label: 'C1', status: 'occupied' },
	{ label: 'C2', status: 'free' },
]

export default function FloorCanvas() {
	return (
		<div className="rounded-3xl border border-ink/10 bg-paper/90 p-6 shadow-soft">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Live floor</p>
					<h3 className="mt-2 font-display text-2xl text-ink">Main dining room</h3>
				</div>
				<span className="rounded-full bg-accent2/10 px-3 py-1 text-xs font-semibold text-accent2">6 tables</span>
			</div>
			<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
				{sampleTables.map((table) => (
					<TableUnit key={table.label} label={table.label} status={table.status} />
				))}
			</div>
		</div>
	)
}
