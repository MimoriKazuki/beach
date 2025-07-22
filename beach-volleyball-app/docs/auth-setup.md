# 認証設定ガイド

## LINE認証の設定

### 1. LINE Developersでチャンネルを作成

1. [LINE Developers](https://developers.line.biz/ja/)にアクセス
2. 新規プロバイダーを作成
3. LINE Loginチャンネルを作成
4. 以下の情報を取得：
   - Channel ID
   - Channel Secret

### 2. Supabaseでの設定

1. Supabaseダッシュボードにログイン
2. Authentication → Providers → LINE を有効化
3. LINE Developersで取得した情報を入力：
   - Client ID: Channel ID
   - Client Secret: Channel Secret
4. Redirect URL をコピーしてLINE Developersに設定

### 3. LINE Developersでリダイレクト設定

1. LINE Login設定で「Callback URL」に以下を追加：
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```

### 4. コードの更新

`app/auth/login/page.tsx`と`app/auth/signup/page.tsx`で：
```javascript
provider: 'github' → provider: 'line'
```

## メール認証の設定

### 1. Supabaseメール設定

1. Authentication → Email Templates で各テンプレートを日本語化
2. 確認メールテンプレート例：

```html
<h2>ビーチボールバレーコミュニティへようこそ</h2>
<p>登録ありがとうございます。以下のボタンをクリックしてメールアドレスを確認してください。</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
```

### 2. SMTP設定（本番環境用）

1. Authentication → SMTP Settings
2. 独自のSMTPサーバーを設定（SendGrid、Amazon SES等）
3. 設定例（SendGrid）：
   - Host: smtp.sendgrid.net
   - Port: 587
   - User: apikey
   - Pass: YOUR_SENDGRID_API_KEY
   - Sender Email: noreply@your-domain.com
   - Sender Name: ビーチボールバレーコミュニティ

### 3. URL設定

1. Authentication → URL Configuration
2. Site URL: `https://your-domain.com`
3. Redirect URLs に追加：
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (開発用)

### 4. メール確認の無効化（開発環境）

開発環境でメール確認をスキップする場合：
1. Authentication → Settings
2. "Enable email confirmations" をOFF

## トラブルシューティング

### LINEログインが動作しない
- Callback URLが正しく設定されているか確認
- Channel IDとSecretが正しいか確認
- Supabaseのプロジェクト設定でLINEが有効になっているか確認

### メールが届かない
- スパムフォルダを確認
- SMTP設定が正しいか確認
- Supabaseの無料プランの場合、1時間あたりの送信制限があります

### 確認メールのリンクが無効
- URL設定のSite URLが正しいか確認
- トークンの有効期限（デフォルト24時間）を確認