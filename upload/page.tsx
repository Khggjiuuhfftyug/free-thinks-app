'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Camera, X, Sparkles, MapPin, Tag, FileText, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { CATEGORY_LABELS, CONDITION_LABELS, type ItemCategory, type ItemCondition } from '@/lib/types'
import { toast } from 'sonner'

const sampleImages = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop',
]

export default function UploadPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, addItem } = useAppStore()
  const [mounted, setMounted] = useState(false)
  
  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ItemCategory>('other')
  const [condition, setCondition] = useState<ItemCondition>('good')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const addSampleImage = () => {
    if (images.length < 4) {
      const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
      setImages([...images, randomImage])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    setIsSubmitting(true)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    addItem({
      title,
      description,
      category,
      condition,
      images,
      location: location || currentUser.location || 'Your area',
      status: 'available',
    })

    toast.success('Item shared successfully!', {
      description: '+25 karma points earned',
    })
    
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">Share an Item</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Camera className="size-4" />
              Photos
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={addSampleImage}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Camera className="size-6" />
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Add up to 4 photos. Click the camera icon to add sample images.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Tag className="size-4" />
              Title
            </label>
            <Input
              placeholder="What are you sharing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4" />
              Description
            </label>
            <Textarea
              placeholder="Describe the item, including any details about its condition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Package className="size-4" />
                Category
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4" />
                Condition
              </label>
              <Select value={condition} onValueChange={(v) => setCondition(v as ItemCondition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4" />
              Pickup Location
            </label>
            <Input
              placeholder="Neighborhood or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Points Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Earn +25 karma points</p>
                <p className="text-sm text-muted-foreground">
                  Share this item to help someone in your community
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner className="size-5" />
            ) : (
              <>
                Share Item
                <Sparkles className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
