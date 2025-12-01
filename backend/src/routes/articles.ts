import express from 'express'
import axios from 'axios'

const router = express.Router()

interface ArticleData {
  title: string
  body: string
  tags: Array<{ name: string; versions: string[] }>
  private: boolean
}

// Qiita API v2 で記事を投稿
router.post('/', async (req, res) => {
  try {
    const articleData: ArticleData = req.body

    // バリデーション
    if (!articleData.title || !articleData.body) {
      return res.status(400).json({
        message: 'タイトルと本文は必須です',
      })
    }

    // Qiita API トークンの確認
    const qiitaToken = process.env.QIITA_ACCESS_TOKEN
    if (!qiitaToken) {
      return res.status(500).json({
        message: 'Qiitaアクセストークンが設定されていません',
      })
    }

    // Qiita API v2 に投稿
    const response = await axios.post(
      'https://qiita.com/api/v2/items',
      {
        title: articleData.title,
        body: articleData.body,
        tags: articleData.tags,
        private: articleData.private,
      },
      {
        headers: {
          'Authorization': `Bearer ${qiitaToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.json({
      success: true,
      url: response.data.url,
      id: response.data.id,
      message: '記事を投稿しました',
    })
  } catch (error: unknown) {
    console.error('Qiita API エラー:', error)
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message =
        error.response?.data?.message ||
        error.message ||
        '投稿に失敗しました'
      
      return res.status(status).json({
        message: `Qiita API エラー: ${message}`,
      })
    }

    res.status(500).json({
      message: '予期しないエラーが発生しました',
    })
  }
})

export { router as articleRoutes }

