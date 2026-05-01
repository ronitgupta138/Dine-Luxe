import TableUnit from './TableUnit'

const sampleTables = [
	{ id: 'a1', label: 'A1', capacity: 4, shape: 'round' as const, zone: 'Patio', status: 'occupied' as const },
	{ id: 'a2', label: 'A2', capacity: 2, shape: 'square' as const, zone: 'Patio', status: 'free' as const },
	{ id: 'b1', label: 'B1', capacity: 6, shape: 'rectangle' as const, zone: 'Main', status: 'reserved' as const },
	{ id: 'b2', label: 'B2', capacity: 4, shape: 'square' as const, zone: 'Main', status: 'cleaning' as const },
	{ id: 'c1', label: 'C1', capacity: 5, shape: 'booth' as const, zone: 'Lounge', status: 'occupied' as const },
	{ id: 'c2', label: 'C2', capacity: 2, shape: 'round' as const, zone: 'Lounge', status: 'free' as const },
]

export default function FloorCanvas() {
	return (
		<div className="rounded-md border border-ink/10 bg-paper/90 p-6 shadow-soft">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Live floor</p>
					<h3 className="mt-2 font-display text-2xl text-ink">Main dining room</h3>
				</div>
				<span className="rounded-full bg-accent2/10 px-3 py-1 text-xs font-semibold text-accent2">6 tables</span>
			</div>
			<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
				{sampleTables.map((table) => (
					<TableUnit key={table.id} table={table} />
				))}
			</div>
		</div>
	)
}
