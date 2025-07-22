"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Tag, User } from "lucide-react"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { LoadingSpinner } from "@/components/ui/spinner"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  category: string
  imageUrl?: string
  isPublished: boolean
  publishedAt: string
  createdAt: string
  author?: string
}

const categoryColors = {
  '施設情報': 'bg-blue-100 text-blue-800',
  '大会情報': 'bg-purple-100 text-purple-800',
  'ルール': 'bg-green-100 text-green-800',
  '練習会': 'bg-orange-100 text-orange-800',
  '募集': 'bg-pink-100 text-pink-800'
}

export default function NewsDetailPage() {
  const params = useParams()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ニュース記事を読み込む
    const savedArticles = localStorage.getItem('news_articles')
    if (savedArticles) {
      const articles: NewsArticle[] = JSON.parse(savedArticles)
      const targetArticle = articles.find(a => a.id === params.id && a.isPublished)
      if (targetArticle) {
        setArticle(targetArticle)
      }
    }
    setIsLoading(false)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!article) {
    notFound()
  }

  // Markdown風のコンテンツをHTMLに変換（簡易版）
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // 見出し
        if (paragraph.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{paragraph.substring(3)}</h2>
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{paragraph.substring(4)}</h3>
        }
        
        // リスト
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- '))
          return (
            <ul key={index} className="list-disc list-inside space-y-1 my-3">
              {items.map((item, i) => (
                <li key={i}>{item.substring(2)}</li>
              ))}
            </ul>
          )
        }
        
        // 通常の段落
        return <p key={index} className="leading-relaxed mb-4">{paragraph}</p>
      })
  }

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        {/* Header */}
        <div className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/news" className="text-foreground flex size-12 shrink-0 items-center">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            ニュース詳細
          </h2>
        </div>

        {/* Article Content */}
        <div className="px-4 py-4">
          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-3">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                }`}>
                  {article.category}
                </span>
              </div>
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">{article.summary}</p>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {formatContent(article.content)}
          </div>

          {/* Back to List */}
          <div className="mt-8 pt-6 border-t">
            <Link href="/news">
              <button className="text-primary text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="h-4 w-4" />
                ニュース一覧に戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </>
  )
}