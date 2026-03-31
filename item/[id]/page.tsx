'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Heart, 
  Bookmark, 
  MapPin, 
  Clock, 
  MessageCircle,
  Share2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { LevelBadge } from '@/components/level-badge'
import { useAppStore } from '@/lib/store'
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, currentUser, items, toggleLike, toggleSave, claimItem } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

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

  const item = items.find(i => i.id === id)

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-medium">Item not found</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  const isLiked = item.likedBy.includes(currentUser.id)
  const isSaved = item.savedBy.includes(currentUser.id)
  const isOwner = item.userId === currentUser.id

  const handleClaim = async () => {
    setIsClaiming(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    claimItem(item.id)
    toast.success('Claim request sent!', {
      description: 'The owner will be notified',
    })
    setIsClaiming(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this free item: ${item.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur"
              onClick={handleShare}
            >
              <Share2 className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur"
              onClick={() => toggleSave(item.id)}
            >
              <Bookmark
                className={cn(
                  'size-5',
                  isSaved && 'fill-primary text-primary'
                )}
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={item.images[0]}
          alt={item.title}
          fill
          className="object-cover"
          priority
        />
        {item.status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
              Claim Pending
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Title & Badges */}
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="flex-1 text-2xl font-bold">{item.title}</h1>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{CATEGORY_LABELS[item.category]}</Badge>
          <Badge variant="outline">{CONDITION_LABELS[item.condition]}</Badge>
          {item.status === 'available' && (
            <Badge className="bg-primary text-primary-foreground">Available</Badge>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-4" />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Engagement */}
        <div className="mt-4 flex items-center gap-4">
          <button
            className="flex items-center gap-1.5 text-sm"
            onClick={() => toggleLike(item.id)}
          >
            <Heart
              className={cn(
                'size-5 transition-colors',
                isLiked && 'fill-destructive text-destructive'
              )}
            />
            <span>{item.likes} likes</span>
          </button>
          <button
            className="flex items-center gap-1.5 text-sm"
            onClick={() => toggleSave(item.id)}
          >
            <Bookmark
              className={cn(
                'size-5 transition-colors',
                isSaved && 'fill-primary text-primary'
              )}
            />
            <span>{item.saves} saves</span>
          </button>
        </div>

        <Separator className="my-4" />

        {/* Owner */}
        <Link href={`/profile/${item.userId}`}>
          <Card className="border-0 py-0 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="size-12 border-2 border-primary/20">
                <AvatarImage src={item.userAvatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {item.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.userName}</span>
                  <LevelBadge level={item.userLevel} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? 'This is your listing' : 'Item owner'}
                </p>
              </div>
              {!isOwner && (
                <Button variant="outline" size="sm">
                  <MessageCircle className="mr-1 size-4" />
                  Message
                </Button>
              )}
            </CardContent>
          </Card>
        </Link>

        <Separator className="my-4" />

        {/* Description */}
        <div>
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      {!isOwner && item.status === 'available' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="mx-auto flex max-w-lg items-center gap-3 p-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleLike(item.id)}
            >
              <Heart
                className={cn(
                  'size-5',
                  isLiked && 'fill-destructive text-destructive'
                )}
              />
            </Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={handleClaim}
              disabled={isClaiming}
            >
              {isClaiming ? (
                <Spinner className="size-5" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-5" />
                  Request Item
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="mx-auto flex max-w-lg items-center gap-3 p-4">
            <Button variant="outline" className="flex-1">
              Edit Listing
            </Button>
            <Button variant="destructive" className="flex-1">
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
