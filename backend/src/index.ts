import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { articleRoutes } from './routes/articles.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ミドルウェア
app.use(cors())
app.use(express.json())

// ルーティング
app.use('/api/articles', articleRoutes)

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`)
  console.log(`📍 環境: ${process.env.NODE_ENV || 'development'}`)
})

