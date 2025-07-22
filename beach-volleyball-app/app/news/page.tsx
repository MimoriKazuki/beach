"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Tag, Filter } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/spinner"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  category: '施設情報' | '大会情報' | 'ルール' | '練習会' | '募集'
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

export default function NewsListPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ニュース記事を読み込む
    const savedArticles = localStorage.getItem('news_articles')
    if (savedArticles) {
      const articleList: NewsArticle[] = JSON.parse(savedArticles)
      // 公開中の記事のみ表示
      const publishedArticles = articleList
        .filter(a => a.isPublished)
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      setArticles(publishedArticles)
      setFilteredArticles(publishedArticles)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(articles)
    } else {
      setFilteredArticles(articles.filter(a => a.category === selectedCategory))
    }
  }, [selectedCategory, articles])

  const categories = ['all', '施設情報', '大会情報', 'ルール', '練習会', '募集']

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        {/* Header */}
        <div className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/" className="text-foreground flex size-12 shrink-0 items-center">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            お知らせ一覧
          </h2>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        <div className="px-4 space-y-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedCategory === 'all' 
                  ? 'お知らせはまだありません' 
                  : `${selectedCategory}のお知らせはありません`}
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`} className="block">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold flex-1">{article.title}</h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      categoryColors[article.category]
                    )}>
                      {article.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {article.author && (
                      <span>作成者: {article.author}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  )
}