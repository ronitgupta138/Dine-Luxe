import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CartItemProps = {
	name: string
	description?: string
	price: number
	quantity: number
	onIncrease: () => void
	onDecrease: () => void
	onRemove: () => void
}

export default function CartItem({
	name,
	description,
	price,
	quantity,
	onIncrease,
	onDecrease,
	onRemove,
}: CartItemProps) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-md border border-ink/10 bg-paper/90 p-4 shadow-soft">
			<div>
				<p className="font-semibold text-ink">{name}</p>
				{description && <p className="text-xs text-muted">{description}</p>}
				<p className="mt-2 text-sm font-semibold text-ink">${price.toFixed(2)}</p>
			</div>
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" size="sm" onClick={onDecrease}>
					<Minus className="h-3 w-3" />
				</Button>
				<span className="text-sm font-semibold text-ink">{quantity}</span>
				<Button type="button" variant="outline" size="sm" onClick={onIncrease}>
					<Plus className="h-3 w-3" />
				</Button>
				<Button type="button" variant="ghost" size="sm" onClick={onRemove}>
					<Trash2 className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}
