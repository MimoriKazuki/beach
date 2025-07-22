interface Comment {
  id: string
  eventId: string
  content: string
  likes: number
  likedBy: string[] // User IDs stored in localStorage
  createdAt: string
  userId: string
  userName: string
  userAvatar?: string
}

const COMMENTS_KEY = 'event_comments'
const USER_ID_KEY = 'anonymous_user_id'

// Get current user ID
export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  
  // デモユーザー情報から取得
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    const userData = JSON.parse(demoUser)
    return userData.email || 'anonymous'
  }
  return 'anonymous'
}

// Get current user info
export function getCurrentUserInfo(): { id: string, name: string, avatar?: string } {
  if (typeof window === 'undefined') {
    return {
      id: 'anonymous',
      name: '名無しユーザー'
    }
  }
  
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    const userData = JSON.parse(demoUser)
    return {
      id: userData.email || 'anonymous',
      name: userData.name || '名無しユーザー',
      avatar: userData.avatar
    }
  }
  return {
    id: 'anonymous',
    name: '名無しユーザー'
  }
}

// Get all comments for an event
export function getEventComments(eventId: string): Comment[] {
  if (typeof window === 'undefined') return []
  
  const allComments = localStorage.getItem(COMMENTS_KEY)
  if (!allComments) return []
  
  const comments: Comment[] = JSON.parse(allComments)
  return comments
    .filter(comment => comment.eventId === eventId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Add a new comment
export function addComment(eventId: string, content: string): Comment {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add comment during SSR')
  }
  
  const allComments = localStorage.getItem(COMMENTS_KEY)
  const comments: Comment[] = allComments ? JSON.parse(allComments) : []
  const userInfo = getCurrentUserInfo()
  
  const newComment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    content,
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
    userId: userInfo.id,
    userName: userInfo.name,
    userAvatar: userInfo.avatar
  }
  
  comments.push(newComment)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  
  return newComment
}

// Toggle like on a comment
export function toggleCommentLike(commentId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const userId = getCurrentUserId()
  const allComments = localStorage.getItem(COMMENTS_KEY)
  if (!allComments) return false
  
  const comments: Comment[] = JSON.parse(allComments)
  const commentIndex = comments.findIndex(c => c.id === commentId)
  
  if (commentIndex === -1) return false
  
  const comment = comments[commentIndex]
  const likedIndex = comment.likedBy.indexOf(userId)
  
  if (likedIndex > -1) {
    // Unlike
    comment.likedBy.splice(likedIndex, 1)
    comment.likes = Math.max(0, comment.likes - 1)
  } else {
    // Like
    comment.likedBy.push(userId)
    comment.likes += 1
  }
  
  comments[commentIndex] = comment
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  
  return likedIndex === -1 // Return true if liked, false if unliked
}

// Check if current user has liked a comment
export function hasUserLikedComment(commentId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const userId = getCurrentUserId()
  const allComments = localStorage.getItem(COMMENTS_KEY)
  if (!allComments) return false
  
  const comments: Comment[] = JSON.parse(allComments)
  const comment = comments.find(c => c.id === commentId)
  
  return comment ? comment.likedBy.includes(userId) : false
}

// Get comment count for an event
export function getEventCommentCount(eventId: string): number {
  if (typeof window === 'undefined') return 0
  
  const comments = getEventComments(eventId)
  return comments.length
}