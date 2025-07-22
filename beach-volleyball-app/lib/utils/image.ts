/**
 * 画像URLのバリデーションとデフォルト画像の処理
 */

// デフォルト画像URL
export const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
export const DEFAULT_AVATAR_IMAGE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"

/**
 * 有効な画像URLかどうかをチェックし、無効な場合はデフォルト画像を返す
 * @param url - チェックする画像URL
 * @param defaultImage - デフォルト画像URL
 * @returns 有効な画像URL
 */
export function getValidImageUrl(url: string | null | undefined, defaultImage: string = DEFAULT_EVENT_IMAGE): string {
  // null, undefined, 空文字列の場合はデフォルト画像を返す
  if (!url || url.trim() === "") {
    return defaultImage
  }
  
  // 相対パスや不正なURLの場合もデフォルト画像を返す
  try {
    // data:image形式のBase64画像は許可
    if (url.startsWith('data:image/')) {
      return url
    }
    
    // HTTPまたはHTTPSのURLのみ許可
    const urlObj = new URL(url)
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return url
    }
  } catch {
    // URLパースエラーの場合
    return defaultImage
  }
  
  return defaultImage
}