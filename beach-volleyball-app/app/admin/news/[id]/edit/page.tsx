"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/spinner"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  category: '施設情報' | '大会情報' | 'ルール' | '練習会' | '募集'
  isPublished: boolean
  publishedAt: string
  createdAt: string
  author?: string
}

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "施設情報" as const,
    isPublished: false
  })

  useEffect(() => {
    // ニュース記事を読み込む
    const savedArticles = localStorage.getItem('news_articles')
    if (savedArticles) {
      const articles = JSON.parse(savedArticles)
      const targetArticle = articles.find((a: NewsArticle) => a.id === params.id)
      if (targetArticle) {
        setArticle(targetArticle)
        setFormData({
          title: targetArticle.title,
          summary: targetArticle.summary,
          content: targetArticle.content,
          category: targetArticle.category,
          isPublished: targetArticle.isPublished
        })
      } else {
        router.push("/admin/news")
      }
    }
  }, [router, params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 既存のニュース記事を更新
    const savedArticles = localStorage.getItem('news_articles')
    if (savedArticles && article) {
      const articles = JSON.parse(savedArticles)
      const updatedArticles = articles.map((a: NewsArticle) =>
        a.id === article.id
          ? {
              ...a,
              ...formData,
              publishedAt: formData.isPublished && !a.isPublished 
                ? new Date().toISOString() 
                : a.publishedAt
            }
          : a
      )
      
      localStorage.setItem('news_articles', JSON.stringify(updatedArticles))
      
      setTimeout(() => {
        setIsLoading(false)
        router.push("/admin/news")
      }, 500)
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin/news" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          ニュースを編集
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            要約 <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
            maxLength={200}
            placeholder="一覧に表示される短い説明文"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.summary.length}/200文字
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
          >
            <option value="施設情報">施設情報</option>
            <option value="大会情報">大会情報</option>
            <option value="ルール">ルール</option>
            <option value="練習会">練習会</option>
            <option value="募集">募集</option>
          </select>
        </div>


        <div>
          <label className="text-sm font-medium mb-1 block">
            本文 <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg bg-background resize-none font-mono text-sm"
            rows={12}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            placeholder="Markdown形式で記述できます"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Markdown形式対応（見出し、リスト、太字、斜体など）
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="isPublished"
            className="h-4 w-4"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          />
          <label htmlFor="isPublished" className="text-sm">
            公開する
          </label>
        </div>

        {/* Article Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p>作成日: {new Date(article.createdAt).toLocaleString('ja-JP')}</p>
          {article.publishedAt && (
            <p>公開日: {new Date(article.publishedAt).toLocaleString('ja-JP')}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading || !formData.title || !formData.summary || !formData.content}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "更新中..." : "変更を保存"}
        </Button>
      </form>
    </div>
  )
}