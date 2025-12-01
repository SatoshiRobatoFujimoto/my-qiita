# Backend API

Qiita API v2との連携を行うバックエンドサーバーです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`backend`ディレクトリに`.env`ファイルを作成し、以下の内容を設定してください：

```env
# Qiita Access Token
# 取得方法: https://qiita.com/settings/applications
QIITA_ACCESS_TOKEN=your_qiita_access_token_here

# サーバーポート
PORT=3001

# 環境
NODE_ENV=development
```

### Qiitaアクセストークンの取得方法

1. https://qiita.com/settings/applications にアクセス
2. 「個人用アクセストークン」セクションで「新しくトークンを発行」をクリック
3. 説明を入力し、必要なスコープを選択（`write_qiita`が必要です）
4. 発行されたトークンを`.env`ファイルの`QIITA_ACCESS_TOKEN`に設定

## 開発サーバーの起動

```bash
npm run dev
```

サーバーは `http://localhost:3001` で起動します。

## API エンドポイント

### POST /api/articles

Qiitaに記事を投稿します。

**リクエストボディ:**
```json
{
  "title": "記事のタイトル",
  "body": "マークダウン本文",
  "tags": [
    { "name": "JavaScript", "versions": [] },
    { "name": "React", "versions": [] }
  ],
  "private": false
}
```

**レスポンス:**
```json
{
  "success": true,
  "url": "https://qiita.com/...",
  "id": "記事ID",
  "message": "記事を投稿しました"
}
```

## ビルド

```bash
npm run build
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

## 本番環境での起動

```bash
npm start
```

