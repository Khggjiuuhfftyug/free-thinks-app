'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Gift, Heart, Sparkles, Award } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BottomNav } from '@/components/bottom-nav'
import { LevelBadge } from '@/components/level-badge'
import { ItemCard } from '@/components/item-card'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/lib/store'
import { LEVEL_NAMES } from '@/lib/types'
import { mockUsers } from '@/lib/mock-data'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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

  // If viewing own profile, redirect to main profile
  if (id === currentUser.id) {
    router.push('/profile')
    return null
  }

  const user = mockUsers.find(u => u.id === id)

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-lg font-medium">User not found</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  const userItems = items.filter(item => item.userId === user.id)
  const levelName = LEVEL_NAMES[Math.min(user.level - 1, LEVEL_NAMES.length - 1)]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">{user.displayName}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Profile Card */}
        <Card className="border-0 py-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-20 border-4 border-primary/20">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{user.displayName}</h2>
                  <LevelBadge level={user.level} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{levelName}</p>
                {user.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3" />
                    {user.location}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-3" />
                  Joined {format(new Date(user.joinedAt), 'MMM yyyy')}
                </div>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-sm text-muted-foreground">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Sparkles className="size-5" />
                  {user.points}
                </div>
                <p className="text-xs text-muted-foreground">Karma Points</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Gift className="size-5 text-primary" />
                  {user.itemsGiven}
                </div>
                <p className="text-xs text-muted-foreground">Items Given</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Heart className="size-5 text-primary" />
                  {user.itemsReceived}
                </div>
                <p className="text-xs text-muted-foreground">Received</p>
              </div>
            </div>

            {/* Message Button */}
            <Button className="mt-6 w-full">
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Badges */}
        {user.badges.length > 0 && (
          <Card className="mt-4 border-0 py-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  <span className="font-medium">Badges</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.badges.length} earned
                </span>
              </div>
              <div className="mt-3 flex gap-3">
                {user.badges.map(badge => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3"
                    title={badge.description}
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Award className="size-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Items */}
        {userItems.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">{user.displayName}&apos;s Listings</h3>
            <div className="space-y-3">
              {userItems.map(item => (
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
