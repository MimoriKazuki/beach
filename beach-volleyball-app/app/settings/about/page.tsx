"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          利用規約・プライバシーポリシー
        </h2>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* 利用規約 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">利用規約</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-blue-500">▸</span> サービスについて
              </h4>
              <p className="leading-relaxed pl-4">
                ビーチボールバレーコミュニティは、ビーチボールバレーを楽しむ皆様のための交流・イベント管理プラットフォームです。
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-blue-500">▸</span> ご利用にあたって
              </h4>
              <p className="leading-relaxed pl-4 mb-2">
                本サービスをご利用いただくには、以下の事項にご同意いただく必要があります：
              </p>
              <ul className="space-y-1 pl-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>正確な情報の登録</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>他の利用者への配慮</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>スポーツマンシップに則った行動</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-blue-500">▸</span> 禁止事項
              </h4>
              <ul className="space-y-1 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>他の利用者への迷惑行為</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>虚偽の情報登録</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>営利目的での無断利用</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>その他、運営が不適切と判断する行為</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* プライバシーポリシー */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🔒</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">プライバシーポリシー</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span className="text-green-500">▸</span> 取得する情報
              </h4>
              <ul className="space-y-1 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>お名前・メールアドレス</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>プロフィール情報（地域、スキルレベル）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>イベント参加履歴</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span className="text-green-500">▸</span> 情報の利用目的
              </h4>
              <ul className="space-y-1 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>サービスの提供・改善</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>イベント情報のお知らせ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>お問い合わせへの対応</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span className="text-green-500">▸</span> 情報の保護
              </h4>
              <p className="leading-relaxed pl-4">
                お預かりした個人情報は適切に管理し、第三者への提供は行いません。
                セキュリティ対策を実施し、安全な環境でデータを保管しています。
              </p>
            </div>
          </div>
        </div>

        {/* コミュニティガイドライン */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🤝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">コミュニティガイドライン</h3>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              より良いコミュニティ作りのため、以下の点にご協力ください：
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏐</span>
                <div>
                  <p className="font-semibold text-amber-900">フェアプレー精神</p>
                  <p className="text-xs text-gray-600">スポーツマンシップを大切にしましょう</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-amber-900">積極的な交流</p>
                  <p className="text-xs text-gray-600">初心者も経験者も楽しく交流しましょう</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="font-semibold text-amber-900">お互いを尊重</p>
                  <p className="text-xs text-gray-600">多様性を認め合い、楽しい場を作りましょう</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* バージョン情報 */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6 text-center shadow-sm">
          <div className="mb-3">
            <span className="text-3xl">🏐</span>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">ビーチボールバレーコミュニティ</p>
          <p className="text-xs text-gray-500 mb-3">Version 1.0.0</p>
          <div className="border-t pt-3">
            <p className="text-xs text-gray-400">最終更新日: 2025年7月22日</p>
            <p className="text-xs text-gray-400 mt-1">© 2025 Beach Volleyball Community</p>
          </div>
        </div>
      </div>
    </div>
  )
}