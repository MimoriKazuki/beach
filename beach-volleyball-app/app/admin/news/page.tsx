"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Plus, Eye, EyeOff, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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

const categoryColors = {
  '施設情報': 'bg-blue-100 text-blue-800',
  '大会情報': 'bg-purple-100 text-purple-800',
  'ルール': 'bg-green-100 text-green-800',
  '練習会': 'bg-orange-100 text-orange-800',
  '募集': 'bg-pink-100 text-pink-800'
}

export default function NewsManagementPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    // 管理者権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push("/")
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (!userData.isAdmin) {
      router.push("/admin")
      return
    }

    // ニュース記事を読み込む
    const savedArticles = localStorage.getItem('news_articles')
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles))
    } else {
      // デモデータを設定
      const demoArticles: NewsArticle[] = [
        {
          id: "1",
          title: "ビーチボールバレー専用コートオープン",
          summary: "待望の専用コートが大宮体育館にオープンしました。最新設備を完備し、快適なプレー環境を提供します。",
          content: `待望のビーチボールバレー専用コートが大宮体育館にオープンしました。

## 新設備の特徴

### 1. 最新のコート設備
- 国際規格に準拠したコートサイズ
- プロ仕様のネットシステム
- LED照明による明るい環境

### 2. 快適な付帯設備
- 更衣室・シャワー完備
- 観戦席50席
- 無料駐車場30台分

### 3. 利用料金
- 平日: 1時間 2,000円
- 休日: 1時間 3,000円
- 会員割引あり

皆様のご利用をお待ちしております！`,
          category: "施設情報",
          isPublished: true,
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          author: "管理者"
        },
        {
          id: "2",
          title: "春季大会エントリー開始",
          summary: "2025年春季大会のエントリーを開始しました。初心者クラスから上級クラスまで、幅広くご参加いただけます。",
          content: `2025年春季ビーチボールバレー大会のエントリーを開始いたしました。

## 大会概要
- 日程: 2025年8月20日（水）
- 場所: 大宮市民体育館
- 参加費: 3,000円/人

## クラス分け
- 初心者クラス
- 中級クラス
- 上級クラス

## エントリー方法
1. 公式サイトからエントリーフォームへアクセス
2. 必要事項を入力
3. 参加費を支払い

締切は8月10日です。お早めにお申し込みください！`,
          category: "大会情報",
          isPublished: true,
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          author: "大会事務局"
        },
        {
          id: "3",
          title: "新ルール改定のお知らせ",
          summary: "2025年度より一部ルールが改定されます。主な変更点をご確認ください。",
          content: `2025年度よりビーチボールバレーのルールが一部改定されます。

## 主な変更点

### 1. サーブルール
- サーブ時の立ち位置が緩和されました
- アンダーハンドサーブが公式に認められました

### 2. 得点システム
- 3セットマッチ（25点先取）に統一
- デュースは2点差まで

### 3. タイムアウト
- 各セット2回まで（従来は1回）
- 30秒間（従来と同じ）

詳細は公式ルールブックをご確認ください。`,
          category: "ルール",
          isPublished: true,
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          author: "ルール委員会"
        }
      ]
      setArticles(demoArticles)
      localStorage.setItem('news_articles', JSON.stringify(demoArticles))
    }
  }, [router])

  const togglePublished = (id: string) => {
    const updatedArticles = articles.map(article => 
      article.id === id ? { ...article, isPublished: !article.isPublished } : article
    )
    setArticles(updatedArticles)
    localStorage.setItem('news_articles', JSON.stringify(updatedArticles))
  }

  const deleteArticle = (id: string) => {
    setIsDeleting(id)
    setTimeout(() => {
      const updatedArticles = articles.filter(article => article.id !== id)
      setArticles(updatedArticles)
      localStorage.setItem('news_articles', JSON.stringify(updatedArticles))
      setIsDeleting(null)
    }, 300)
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          ニュース管理
        </h2>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <Link href="/admin/news/create">
          <Button className="w-full flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しいニュースを作成
          </Button>
        </Link>
      </div>

      {/* News List */}
      <div className="px-4 py-3">
        <h3 className="text-base font-semibold mb-3">ニュース一覧</h3>
        {articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>ニュースはまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((article) => (
              <div
                key={article.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isDeleting === article.id ? 'opacity-50 scale-95' : '',
                  !article.isPublished ? 'bg-gray-50 opacity-60' : 'bg-white'
                )}
              >
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-base">{article.title}</h4>
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
                    <div className="text-xs text-muted-foreground">
                      作成日: {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                      {article.author && ` · 作成者: ${article.author}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => togglePublished(article.id)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {article.isPublished ? (
                      <>
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">公開中</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">非公開</span>
                      </>
                    )}
                  </button>
                  <div className="flex-1" />
                  <Link href={`/news/${article.id}`} target="_blank">
                    <Button size="sm" variant="ghost" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      プレビュー
                    </Button>
                  </Link>
                  <Link href={`/admin/news/${article.id}/edit`}>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('このニュースを削除してもよろしいですか？')) {
                        deleteArticle(article.id)
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 mt-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">ニュース管理について</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 公開中のニュースのみサイトに表示されます</li>
            <li>• カテゴリーごとに色分けされて表示されます</li>
            <li>• Markdown形式で記事を作成できます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}