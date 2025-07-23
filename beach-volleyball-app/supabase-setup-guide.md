# Supabase セットアップガイド

## 1. Supabaseダッシュボードでの設定

### ステップ1: プロジェクトの確認
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択

### ステップ2: 認証設定の確認
1. 左メニューから「Authentication」を選択
2. 「Providers」タブをクリック
3. 「Email」が有効になっていることを確認
   - 無効の場合は、「Email」をクリックして有効化
   - 「Enable Email provider」をONにする

### ステップ3: データベースセットアップ
1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/setup.sql`の内容をコピーして貼り付け
4. 「Run」ボタンをクリックして実行

### ステップ4: 環境変数の確認
1. プロジェクトの「Settings」→「API」を開く
2. 以下の値が`.env.local`と一致しているか確認：
   - Project URL: `https://awvdmlabtsfbermpjbvl.supabase.co`
   - anon public key: `eyJhbGc...`で始まる値

## 2. ローカル環境での確認

### 開発サーバーの再起動
```bash
# Ctrl+C で現在のサーバーを停止
npm run dev
```

### ブラウザでの確認
1. ブラウザの開発者ツールを開く（F12）
2. 「Application」タブ → 「Storage」→「Clear site data」
3. すべてのキャッシュをクリア
4. ページをリロード

## 3. テストユーザーの作成

### Supabaseダッシュボードから作成
1. 「Authentication」→「Users」
2. 「Add user」→「Create new user」
3. 以下の情報で作成：
   - Email: `test@example.com`
   - Password: `testpassword123`
   - 「Auto Confirm User」にチェック

## 4. トラブルシューティング

### 問題: ログインが動作しない
1. ネットワークタブでSupabaseへのリクエストを確認
2. コンソールでエラーメッセージを確認
3. 以下を試す：
   - 別のブラウザで試す
   - プライベートウィンドウで試す
   - VPNを無効化

### 問題: CORS エラー
1. Supabaseダッシュボードで「Settings」→「API」
2. 「CORS Allowed Origins」に`http://localhost:3001`を追加

### 問題: プロジェクトが一時停止
1. 無料プランの場合、7日間使用しないとプロジェクトが一時停止
2. ダッシュボードで「Restore project」をクリック

## 5. デモモードとSupabaseモードの切り替え

現在、アプリは両方のモードをサポートしています：
- **デモモード**: Supabaseが設定されていない場合に自動的に有効
- **Supabaseモード**: 環境変数が正しく設定されている場合に有効

デモアカウント（Supabaseが動作しない場合）：
- Email: `admin@example.com`
- Password: `admin123`