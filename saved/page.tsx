'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Heart, Gift } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BottomNav } from '@/components/bottom-nav'
import { ItemCard } from '@/components/item-card'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/lib/store'

export default function SavedPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, items } = useAppStore()
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
        <Spinner className="size-8" />
      </div>
    )
  }

  const savedItems = items.filter(item => item.savedBy.includes(currentUser.id))
  const likedItems = items.filter(item => item.likedBy.includes(currentUser.id))

  const EmptyState = ({ icon: Icon, title, description }: { 
    icon: React.ElementType
    title: string 
    description: string 
  }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold">Your Collection</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg">
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="saved"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Bookmark className="mr-2 size-4" />
              Saved ({savedItems.length})
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Heart className="mr-2 size-4" />
              Liked ({likedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="px-4 py-4">
            {savedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {savedItems.map(item => (
                  <ItemCard key={item.id} item={item} variant="compact" />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No saved items"
                description="Save items you're interested in to find them later"
              />
            )}
          </TabsContent>

          <TabsContent value="liked" className="px-4 py-4">
            {likedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {likedItems.map(item => (
                  <ItemCard key={item.id} item={item} variant="compact" />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="No liked items"
                description="Show some love to items you appreciate"
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
