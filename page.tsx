'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BottomNav } from '@/components/bottom-nav'
import { ItemCard } from '@/components/item-card'
import { CategoryFilter } from '@/components/category-filter'
import { useAppStore } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, items, selectedCategory, searchQuery } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.status !== 'claimed'
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Gift className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Free Thinks</h1>
              <p className="text-xs text-muted-foreground">Share freely</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
            </Button>
            <Avatar className="size-9 border-2 border-primary/20">
              <AvatarImage src={currentUser.photoURL || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {currentUser.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Welcome Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <h2 className="text-lg font-semibold">
            Welcome back, {currentUser.displayName.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <span className="font-medium text-primary">{currentUser.points} points</span> and helped {currentUser.itemsGiven} people
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Browse by category</h3>
          <CategoryFilter />
        </div>

        {/* Items Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {selectedCategory === 'all' ? 'Latest Items' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </h3>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} available
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Gift className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No items found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different category or check back later
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
