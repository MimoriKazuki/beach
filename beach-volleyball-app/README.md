# ビーチボールバレー コミュニティアプリ

ビーチボールバレーの大会運営と練習会管理のためのプログレッシブウェブアプリケーション（PWA）です。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **バックエンド**: Supabase (PostgreSQL + Auth + Realtime)
- **UI**: Tailwind CSS + Shadcn/UI
- **PWA**: next-pwa

## セットアップ

### Supabaseを使用しない場合（モックモード）

現在の設定ではSupabase環境変数がプレースホルダーになっており、認証機能はモックモードで動作します。

### Supabaseを使用する場合

### 1. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、Supabaseの認証情報を設定してください：

```bash
cp .env.local.example .env.local
```

```env
# 実際のSupabaseプロジェクトのURLとキーを設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

※ SupabaseプロジェクトのURLとAnon Keyは[Supabase Dashboard](https://app.supabase.com)のプロジェクト設定から取得できます。

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseデータベースのセットアップ

`supabase/migrations/00001_initial_schema.sql`のSQLをSupabaseのSQLエディタで実行してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## プロジェクト構造

```
/app                    # Next.js App Router
  /api/                # APIルート
  /auth/               # 認証関連ページ
  /events/             # イベント関連ページ
  layout.tsx           # ルートレイアウト
  page.tsx             # ホームページ

/components            # UIコンポーネント
  /layout/             # レイアウトコンポーネント
  /ui/                 # 基本UIコンポーネント
  /events/             # イベント関連コンポーネント

/lib                   # ユーティリティ
  /supabase/           # Supabaseクライアント設定

/public                # 静的ファイル
  manifest.json        # PWAマニフェスト
```

## 主要機能

- ユーザー認証（サインアップ/ログイン）
- イベント管理（大会・練習会）
- リアルタイムスコア更新
- PWA対応（オフライン動作・インストール可能）

## 開発ロードマップ

1. ✅ 基盤構築
2. ✅ UIコンポーネント設定
3. ✅ 認証システム実装
4. ⏳ イベント機能実装
5. 大会運営機能
6. リアルタイム機能
7. PWA最適化
