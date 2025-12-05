import express from 'express'
import fs from 'fs/promises'
import path from 'path'

const router = express.Router()

interface DraftData {
  id: string
  title: string
  tags: string
  markdown: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

// draftsフォルダのパス
const DRAFTS_DIR = path.join(process.cwd(), 'drafts')

// draftsフォルダが存在しない場合は作成
const ensureDraftsDir = async () => {
  try {
    await fs.access(DRAFTS_DIR)
  } catch {
    await fs.mkdir(DRAFTS_DIR, { recursive: true })
  }
}

// 下書きを保存
router.post('/', async (req, res) => {
  try {
    await ensureDraftsDir()

    const { title, tags, markdown, isPrivate } = req.body

    // IDを生成（タイムスタンプベース）
    const id = `draft-${Date.now()}`
    const now = new Date().toISOString()

    const draftData: DraftData = {
      id,
      title: title || '',
      tags: tags || '',
      markdown: markdown || '',
      isPrivate: isPrivate || false,
      createdAt: now,
      updatedAt: now,
    }

    const filePath = path.join(DRAFTS_DIR, `${id}.json`)
    await fs.writeFile(filePath, JSON.stringify(draftData, null, 2), 'utf-8')

    res.json({
      success: true,
      id,
      message: '下書きを保存しました',
    })
  } catch (error) {
    console.error('下書き保存エラー:', error)
    res.status(500).json({
      message: '下書きの保存に失敗しました',
    })
  }
})

// 最新の下書きを取得
router.get('/', async (req, res) => {
  try {
    await ensureDraftsDir()

    const files = await fs.readdir(DRAFTS_DIR)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    if (jsonFiles.length === 0) {
      return res.json(null)
    }

    // 最新のファイルを取得（更新日時でソート）
    const filesWithStats = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DRAFTS_DIR, file)
        const stats = await fs.stat(filePath)
        return { file, mtime: stats.mtime }
      })
    )

    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    const latestFile = filesWithStats[0].file

    const filePath = path.join(DRAFTS_DIR, latestFile)
    const content = await fs.readFile(filePath, 'utf-8')
    const draftData = JSON.parse(content)

    res.json(draftData)
  } catch (error) {
    console.error('下書き取得エラー:', error)
    res.status(500).json({
      message: '下書きの取得に失敗しました',
    })
  }
})

// 下書き一覧を取得
router.get('/list', async (req, res) => {
  try {
    await ensureDraftsDir()

    const files = await fs.readdir(DRAFTS_DIR)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    const drafts = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DRAFTS_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(content)
      })
    )

    // 更新日時でソート（新しい順）
    drafts.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    res.json(drafts)
  } catch (error) {
    console.error('下書き一覧取得エラー:', error)
    res.status(500).json({
      message: '下書き一覧の取得に失敗しました',
    })
  }
})

// 特定の下書きを取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(DRAFTS_DIR, `${id}.json`)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const draftData = JSON.parse(content)
      res.json(draftData)
    } catch {
      res.status(404).json({
        message: '下書きが見つかりません',
      })
    }
  } catch (error) {
    console.error('下書き取得エラー:', error)
    res.status(500).json({
      message: '下書きの取得に失敗しました',
    })
  }
})

// 下書きを更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, tags, markdown, isPrivate } = req.body
    const filePath = path.join(DRAFTS_DIR, `${id}.json`)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const draftData: DraftData = JSON.parse(content)

      draftData.title = title !== undefined ? title : draftData.title
      draftData.tags = tags !== undefined ? tags : draftData.tags
      draftData.markdown = markdown !== undefined ? markdown : draftData.markdown
      draftData.isPrivate = isPrivate !== undefined ? isPrivate : draftData.isPrivate
      draftData.updatedAt = new Date().toISOString()

      await fs.writeFile(filePath, JSON.stringify(draftData, null, 2), 'utf-8')

      res.json({
        success: true,
        message: '下書きを更新しました',
      })
    } catch {
      res.status(404).json({
        message: '下書きが見つかりません',
      })
    }
  } catch (error) {
    console.error('下書き更新エラー:', error)
    res.status(500).json({
      message: '下書きの更新に失敗しました',
    })
  }
})

// 下書きを削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(DRAFTS_DIR, `${id}.json`)

    try {
      await fs.unlink(filePath)
      res.json({
        success: true,
        message: '下書きを削除しました',
      })
    } catch {
      res.status(404).json({
        message: '下書きが見つかりません',
      })
    }
  } catch (error) {
    console.error('下書き削除エラー:', error)
    res.status(500).json({
      message: '下書きの削除に失敗しました',
    })
  }
})

export { router as draftRoutes }

