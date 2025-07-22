"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function CreateNewsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "施設情報" as const,
    isPublished: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 既存のニュース記事を取得
    const savedArticles = localStorage.getItem('news_articles')
    const articles = savedArticles ? JSON.parse(savedArticles) : []
    
    // 新しい記事を作成
    const newArticle: NewsArticle = {
      id: Date.now().toString(),
      ...formData,
      publishedAt: formData.isPublished ? new Date().toISOString() : "",
      createdAt: new Date().toISOString(),
      author: "管理者"
    }
    
    // 記事を追加して保存
    articles.unshift(newArticle)
    localStorage.setItem('news_articles', JSON.stringify(articles))
    
    setTimeout(() => {
      setIsLoading(false)
      router.push("/admin/news")
    }, 500)
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin/news" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          ニュースを作成
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
            placeholder="Markdown形式で記述できます

## 見出し2
### 見出し3

- リスト項目1
- リスト項目2

**太字** や *斜体* も使えます"
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
            すぐに公開する
          </label>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">プレビュー</h3>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">
                {formData.title || "タイトル"}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                formData.category === '施設情報' ? 'bg-blue-100 text-blue-800' :
                formData.category === '大会情報' ? 'bg-purple-100 text-purple-800' :
                formData.category === 'ルール' ? 'bg-green-100 text-green-800' :
                formData.category === '練習会' ? 'bg-orange-100 text-orange-800' :
                'bg-pink-100 text-pink-800'
              }`}>
                {formData.category}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {formData.summary || "要約がここに表示されます"}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading || !formData.title || !formData.summary || !formData.content}
        >
          <FileText className="h-4 w-4 mr-2" />
          {isLoading ? "作成中..." : "ニュースを作成"}
        </Button>
      </form>
    </div>
  )
}