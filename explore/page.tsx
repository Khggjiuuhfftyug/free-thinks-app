'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal, MapPin, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/bottom-nav'
import { ItemCard } from '@/components/item-card'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/lib/store'
import { CATEGORY_LABELS, type ItemCategory } from '@/lib/types'

const trendingSearches = ['furniture', 'electronics', 'books', 'kitchen', 'vintage']

export default function ExplorePage() {
  const router = useRouter()
  const { isAuthenticated, items, searchQuery, setSearchQuery, selectedCategory, setCategory } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(debounce)
  }, [localSearch, setSearchQuery])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.status !== 'claimed'
  })

  const clearSearch = () => {
    setLocalSearch('')
    setSearchQuery('')
    setCategory('all')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items, locations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {(localSearch || selectedCategory !== 'all') && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 rounded-full"
              onClick={() => setCategory('all')}
            >
              All
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <Button
                key={value}
                variant={selectedCategory === value ? 'default' : 'outline'}
                size="sm"
                className="flex-shrink-0 rounded-full"
                onClick={() => setCategory(value as ItemCategory)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Trending Searches - Show when no search */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Trending searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(term => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setLocalSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} found
            </p>
            <Button variant="ghost" size="sm" className="text-primary">
              <SlidersHorizontal className="mr-1 size-4" />
              Filters
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Gift className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No items found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try different keywords or categories
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearSearch}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Nearby Section - Show when no search */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <h3 className="font-medium">Near you</h3>
            </div>
            <div className="space-y-3">
              {items.slice(0, 3).map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
