# my-qiita

Qiitaの記事を作成・投稿するためのWebアプリケーションです。左側にマークダウンエディタ、右側にリアルタイムプレビューを表示し、Qiita APIを使用して記事を投稿できます。

## 機能

- 📝 マークダウンエディタ
- 👁️ リアルタイムプレビュー
- 🏷️ タグの追加
- 🔒 公開/非公開の設定
- 📤 Qiitaへの直接投稿

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- react-markdown
- remark-gfm

### バックエンド
- Node.js
- Express
- TypeScript
- Axios (Qiita API連携)

## セットアップ

### 1. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

### 2. バックエンド

```bash
cd backend
npm install
```

#### 環境変数の設定

`backend`ディレクトリに`.env`ファイルを作成し、以下を設定してください：

```env
QIITA_ACCESS_TOKEN=your_qiita_access_token_here
PORT=3001
NODE_ENV=development
```

#### Qiitaアクセストークンの取得

1. https://qiita.com/settings/applications にアクセス
2. 「個人用アクセストークン」で「新しくトークンを発行」
3. 説明を入力し、`write_qiita`スコープを選択
4. 発行されたトークンを`.env`に設定

#### サーバーの起動

```bash
npm run dev
```

バックエンドは `http://localhost:3001` で起動します。

## 使い方

1. フロントエンドとバックエンドの両方を起動
2. ブラウザで `http://localhost:5173` にアクセス
3. タイトルとタグを入力
4. マークダウンで記事を記述
5. 公開/非公開を選択
6. 「投稿する」ボタンをクリック

## プロジェクト構造

```
my-qiita/
├── frontend/          # React + Vite アプリケーション
│   ├── src/
│   │   ├── App.tsx    # メインコンポーネント
│   │   └── App.css    # スタイル
│   └── package.json
├── backend/           # Express API サーバー
│   ├── src/
│   │   ├── index.ts          # サーバーエントリーポイント
│   │   └── routes/
│   │       └── articles.ts   # 記事投稿API
│   └── package.json
└── README.md
```

## 開発

### フロントエンドのビルド

```bash
cd frontend
npm run build
```

### バックエンドのビルド

```bash
cd backend
npm run build
```

## ライセンス

MIT