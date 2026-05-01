import PageWrapper from '@/components/layout/PageWrapper'
import RestaurantCard from '@/components/customer/RestaurantCard'

const restaurants = [
  {
    name: 'Citrus & Ember',
    cuisine: 'Modern Indian',
    distance: '0.8 mi',
    rating: 4.7,
    tag: 'Hot now',
  },
  {
    name: 'North Shore Oyster',
    cuisine: 'Seafood lounge',
    distance: '1.2 mi',
    rating: 4.5,
    tag: 'New',
  },
  {
    name: 'Velvet Tandoor',
    cuisine: 'Tasting menu',
    distance: '1.9 mi',
    rating: 4.9,
    tag: 'Editors pick',
  },
]

export default function Page() {
  return (
    <PageWrapper title="Nearby favorites" subtitle="Customer home">
      <div className="grid gap-6 md:grid-cols-2">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.name} {...restaurant} />
        ))}
      </div>
    </PageWrapper>
  )
}
