"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { FoodCard } from "@/components/customer/FoodCard"
import { Search, SlidersHorizontal } from "lucide-react"

const categories = [
  "All",
  "Starters",
  "Main Course",
  "Breads",
  "Rice",
  "Desserts",
  "Beverages",
]

const menuItems = [
  {
    id: "1",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
    price: 449,
    discountedPrice: 349,
    photoUrl: "/food/butter-chicken.jpg",
    dietaryTags: ["non-veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 25,
    category: "Main Course",
  },
  {
    id: "2",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices and herbs",
    price: 349,
    discountedPrice: 299,
    photoUrl: "/food/paneer-tikka.jpg",
    dietaryTags: ["veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 20,
    category: "Starters",
  },
  {
    id: "3",
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked overnight",
    price: 299,
    discountedPrice: 249,
    photoUrl: "/food/dal-makhani.jpg",
    dietaryTags: ["veg"],
    allergens: ["dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 15,
    category: "Main Course",
  },
  {
    id: "4",
    name: "Garlic Naan",
    description: "Soft bread topped with garlic and butter",
    price: 69,
    photoUrl: "/food/garlic-naan.jpg",
    dietaryTags: ["veg"],
    allergens: ["gluten", "dairy"],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 10,
    category: "Breads",
  },
  {
    id: "5",
    name: "Biryani",
    description: "Fragrant rice with aromatic spices and meat",
    price: 399,
    discountedPrice: 349,
    photoUrl: "/food/biryani.jpg",
    dietaryTags: ["non-veg", "spicy"],
    allergens: [],
    isAvailable: true,
    isSoldOut: false,
    prepTimeMinutes: 30,
    category: "Rice",
  },
]

export default function CustomerMenuPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <PageWrapper title="Menu" subtitle="Explore our delicious offerings">
      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal size={20} />
        </motion.button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? "bg-brand-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Menu Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FoodCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found</p>
        </div>
      )}
    </PageWrapper>
  )
}
