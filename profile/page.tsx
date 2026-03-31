'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Gift, 
  Heart, 
  MapPin, 
  Calendar,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Sparkles,
  Trophy,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { BottomNav } from '@/components/bottom-nav'
import { LevelBadge } from '@/components/level-badge'
import { ItemCard } from '@/components/item-card'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/lib/store'
import { getProgressToNextLevel, getPointsToNextLevel, LEVEL_NAMES } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, currentUser, items, logout } = useAppStore()
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

  const userItems = items.filter(item => item.userId === currentUser.id)
  const progress = getProgressToNextLevel(currentUser.points)
  const pointsToNext = getPointsToNextLevel(currentUser.points)
  const levelName = LEVEL_NAMES[Math.min(currentUser.level - 1, LEVEL_NAMES.length - 1)]

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Profile</h1>
          <Button variant="ghost" size="icon">
            <Settings className="size-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Profile Card */}
        <Card className="border-0 py-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-20 border-4 border-primary/20">
                <AvatarImage src={currentUser.photoURL || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {currentUser.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{currentUser.displayName}</h2>
                  <LevelBadge level={currentUser.level} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{levelName}</p>
                {currentUser.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3" />
                    {currentUser.location}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-3" />
                  Joined {format(new Date(currentUser.joinedAt), 'MMM yyyy')}
                </div>
              </div>
            </div>

            {currentUser.bio && (
              <p className="mt-4 text-sm text-muted-foreground">{currentUser.bio}</p>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Sparkles className="size-5" />
                  {currentUser.points}
                </div>
                <p className="text-xs text-muted-foreground">Karma Points</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Gift className="size-5 text-primary" />
                  {currentUser.itemsGiven}
                </div>
                <p className="text-xs text-muted-foreground">Items Given</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Heart className="size-5 text-primary" />
                  {currentUser.itemsReceived}
                </div>
                <p className="text-xs text-muted-foreground">Received</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card className="mt-4 border-0 py-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-primary" />
                <span className="font-medium">Level Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {pointsToNext > 0 ? `${pointsToNext} pts to next level` : 'Max level!'}
              </span>
            </div>
            <Progress value={progress} className="mt-3 h-3" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Level {currentUser.level}</span>
              <span>Level {currentUser.level + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        {currentUser.badges.length > 0 && (
          <Card className="mt-4 border-0 py-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  <span className="font-medium">Badges</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentUser.badges.length} earned
                </span>
              </div>
              <div className="mt-3 flex gap-3">
                {currentUser.badges.map(badge => (
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

        {/* Settings */}
        <Card className="mt-4 border-0 py-0 shadow-md">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="size-5 text-muted-foreground" />
                ) : (
                  <Sun className="size-5 text-muted-foreground" />
                )}
                <span>Dark Mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <Separator />
            <button
              className="flex w-full items-center justify-between p-4 text-destructive hover:bg-muted/50"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-3">
                <LogOut className="size-5" />
                <span>Sign Out</span>
              </div>
              <ChevronRight className="size-5" />
            </button>
          </CardContent>
        </Card>

        {/* User Items */}
        {userItems.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Your Listings</h3>
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
