import { MapPin, Star } from 'lucide-react'

type RestaurantCardProps = {
	name: string
	cuisine: string
	distance: string
	rating: number
	imageUrl?: string
	tag?: string
}

export default function RestaurantCard({
	name,
	cuisine,
	distance,
	rating,
	imageUrl,
	tag,
}: RestaurantCardProps) {
	return (
		<div className="rounded-3xl border border-ink/10 bg-paper/90 p-4 shadow-soft">
			<div className="relative h-40 w-full overflow-hidden rounded-2xl bg-ink/10">
				{imageUrl ? (
					<img src={imageUrl} alt={name} className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full w-full items-center justify-center text-sm text-muted">Photo pending</div>
				)}
				{tag && (
					<span className="absolute left-3 top-3 rounded-full bg-accent/80 px-3 py-1 text-xs font-semibold text-paper">
						{tag}
					</span>
				)}
			</div>
			<div className="mt-4 space-y-2">
				<div className="flex items-center justify-between">
					<h3 className="font-display text-xl text-ink">{name}</h3>
					<span className="inline-flex items-center gap-1 rounded-full bg-accent2/10 px-3 py-1 text-xs font-semibold text-accent2">
						<Star className="h-3 w-3" />
						{rating.toFixed(1)}
					</span>
				</div>
				<p className="text-sm text-muted">{cuisine}</p>
				<div className="flex items-center gap-2 text-xs text-muted">
					<MapPin className="h-3 w-3" />
					{distance} away
				</div>
			</div>
		</div>
	)
}
