"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Plus, Minus, Leaf, Beef, AlertTriangle } from "lucide-react"

interface FoodCardProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    discountedPrice?: number
    photoUrl?: string
    dietaryTags: string[]
    allergens: string[]
    prepTimeMinutes?: number
    isAvailable: boolean
    isSoldOut: boolean
  }
  quantity?: number
  onAddToCart?: (itemId: string, quantity: number) => void
  className?: string
}

export function FoodCard({ item, quantity = 0, onAddToCart, className }: FoodCardProps) {
  const [showAllergens, setShowAllergens] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price
  const isVeg = item.dietaryTags.includes('veg') || item.dietaryTags.includes('vegan')
  const isNonVeg = item.dietaryTags.includes('non-veg')

  const handleAdd = () => {
    if (item.isSoldOut || !item.isAvailable) return
    onAddToCart?.(item.id, (quantity || 0) + 1)
  }

  const handleRemove = () => {
    if (quantity > 0) {
      onAddToCart?.(item.id, quantity - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow",
        (item.isSoldOut || !item.isAvailable) && "opacity-60",
        className
      )}
    >
      {/* Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {item.photoUrl ? (
          <>
            {!imageLoaded && <div className="skeleton absolute inset-0" />}
            <img
              src={item.photoUrl}
              alt={item.name}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Dietary badge */}
        <div className="absolute top-2 left-2">
          {isVeg && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
              <Leaf size={12} /> Veg
            </span>
          )}
          {isNonVeg && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
              <Beef size={12} /> Non-Veg
            </span>
          )}
        </div>

        {/* Allergen warning */}
        {item.allergens.length > 0 && (
          <button
            onClick={() => setShowAllergens(!showAllergens)}
            className="absolute top-2 right-2 p-1.5 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
            aria-label="Contains allergens"
          >
            <AlertTriangle size={14} />
          </button>
        )}

        {/* Sold out overlay */}
        {(item.isSoldOut || !item.isAvailable) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Allergen tooltip */}
        <AnimatePresence>
          {showAllergens && item.allergens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-10 right-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2 rounded-lg shadow-lg max-w-[200px] z-10"
            >
              <p className="font-semibold mb-1">⚠️ Contains:</p>
              <p>{item.allergens.join(", ")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>

        {/* Price and Add button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              ₹{hasDiscount ? item.discountedPrice : item.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-brand-primary rounded-lg">
              <button
                onClick={handleRemove}
                className="p-1.5 text-white hover:bg-white/10 rounded-l-lg transition-colors touch-target"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-white font-semibold text-sm min-w-[20px] text-center"
              >
                {quantity}
              </motion.span>
              <button
                onClick={handleAdd}
                className="p-1.5 text-white hover:bg-white/10 rounded-r-lg transition-colors touch-target"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              disabled={item.isSoldOut || !item.isAvailable}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-target",
                item.isSoldOut || !item.isAvailable
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-brand-primary text-white hover:bg-brand-primary/90"
              )}
            >
              <Plus size={16} />
              Add
            </motion.button>
          )}
        </div>

        {item.prepTimeMinutes && (
          <p className="text-xs text-gray-400 mt-2">
            ⏱️ {item.prepTimeMinutes} min
          </p>
        )}
      </div>
    </motion.div>
  )
}
