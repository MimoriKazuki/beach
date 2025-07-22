"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  getEventComments,
  addComment,
  toggleCommentLike,
  hasUserLikedComment,
  getEventCommentCount
} from "@/lib/utils/comments"
import { cn } from "@/lib/utils"
import { UserProfileModal } from "@/components/user/profile-modal"
import Image from "next/image"

interface CommentSectionProps {
  eventId: string
}

export function CommentSection({ eventId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    loadComments()
  }, [eventId])

  const loadComments = () => {
    const eventComments = getEventComments(eventId)
    setComments(eventComments)
    
    // Check which comments are liked by current user
    const liked = new Set<string>()
    eventComments.forEach(comment => {
      if (hasUserLikedComment(comment.id)) {
        liked.add(comment.id)
      }
    })
    setLikedComments(liked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    // Add comment
    addComment(eventId, newComment.trim())
    
    // Reset form and reload comments
    setNewComment("")
    loadComments()
    setIsSubmitting(false)
  }

  const handleLike = (commentId: string) => {
    const isLiked = toggleCommentLike(commentId)
    
    setLikedComments(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.add(commentId)
      } else {
        newSet.delete(commentId)
      }
      return newSet
    })
    
    loadComments()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}分前`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}日前`
    } else {
      return format(date, "M月d日", { locale: ja })
    }
  }

  return (
    <div className="border-t">
      {/* Comment Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">コメント</h3>
          <span className="text-sm text-muted-foreground">({comments.length})</span>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            maxLength={200}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="divide-y">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            まだコメントがありません
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    setSelectedUserId(comment.userId)
                    setIsProfileModalOpen(true)
                  }}
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {comment.userAvatar ? (
                    <Image
                      src={comment.userAvatar}
                      alt={comment.userName}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {comment.userName?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => {
                        setSelectedUserId(comment.userId)
                        setIsProfileModalOpen(true)
                      }}
                      className="text-sm font-medium hover:underline"
                    >
                      {comment.userName || "名無しユーザー"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1 mt-2 text-xs transition-colors",
                      likedComments.has(comment.id)
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5",
                        likedComments.has(comment.id) && "fill-current"
                      )}
                    />
                    <span>{comment.likes > 0 && comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId || ""}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setSelectedUserId(null)
        }}
      />
    </div>
  )
}