import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

interface ArticleData {
  title: string
  body: string
  tags: Array<{ name: string; versions: string[] }>
  private: boolean
}

interface DraftData {
  id?: string
  title: string
  tags: string
  markdown: string
  isPrivate: boolean
  createdAt?: string
  updatedAt?: string
}

const API_BASE_URL = 'http://localhost:3001/api'

function App() {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [markdown, setMarkdown] = useState(`# タイトル

## 見出し2

### 見出し3

ここにマークダウンを記入してください。

- リスト項目1
- リスト項目2
- リスト項目3

**太字** や *イタリック* も使えます。

\`\`\`typescript
const code = "コードブロック";
\`\`\`

> 引用文

[リンク](https://example.com)

| テーブル | サンプル |
|---------|---------|
| セル1   | セル2   |
`)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [draftSaved, setDraftSaved] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)

  // ページ読み込み時に下書きを復元
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/drafts`)
        if (response.ok) {
          const draft: DraftData | null = await response.json()
          if (draft) {
            setTitle(draft.title || '')
            setTags(draft.tags || '')
            setMarkdown(draft.markdown || '')
            setIsPrivate(draft.isPrivate || false)
            setCurrentDraftId(draft.id || null)
          }
        }
      } catch (err) {
        console.error('下書きの読み込みに失敗しました:', err)
      }
    }
    loadDraft()
  }, [])

  // 下書きを保存する関数
  const handleSaveDraft = async () => {
    const draftData: DraftData = {
      title,
      tags,
      markdown,
      isPrivate,
    }

    try {
      let response
      if (currentDraftId) {
        // 既存の下書きを更新
        response = await fetch(`${API_BASE_URL}/drafts/${currentDraftId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData),
        })
      } else {
        // 新しい下書きを作成
        response = await fetch(`${API_BASE_URL}/drafts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData),
        })
      }

      if (!response.ok) {
        throw new Error('下書きの保存に失敗しました')
      }

      const result = await response.json()
      if (result.id) {
        setCurrentDraftId(result.id)
      }
      setDraftSaved(true)
      setTimeout(() => {
        setDraftSaved(false)
      }, 2000)
    } catch (err) {
      setError('下書きの保存に失敗しました')
      console.error('下書き保存エラー:', err)
    }
  }

  // 下書きを削除する関数
  const handleClearDraft = async () => {
    if (!confirm('下書きを削除しますか？')) {
      return
    }

    if (currentDraftId) {
      try {
        const response = await fetch(`${API_BASE_URL}/drafts/${currentDraftId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('下書きの削除に失敗しました')
        }
      } catch (err) {
        setError('下書きの削除に失敗しました')
        console.error('下書き削除エラー:', err)
        return
      }
    }

    setTitle('')
    setTags('')
    setMarkdown('')
    setIsPrivate(false)
    setCurrentDraftId(null)
    setSuccess('下書きを削除しました')
    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  const handlePublish = async () => {
    // バリデーション
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (!markdown.trim()) {
      setError('本文を入力してください')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // タグの処理
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => ({ name: tag, versions: [] }))

    const articleData: ArticleData = {
      title: title.trim(),
      body: markdown,
      tags: tagList,
      private: isPrivate,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '投稿に失敗しました')
      }

      const result = await response.json()
      setSuccess(`記事を投稿しました！URL: ${result.url}`)
      
      // 投稿成功後、下書きを削除
      if (currentDraftId) {
        try {
          await fetch(`${API_BASE_URL}/drafts/${currentDraftId}`, {
            method: 'DELETE',
          })
          setCurrentDraftId(null)
        } catch (err) {
          console.error('下書き削除エラー:', err)
        }
      }
      
      // 成功後、5秒後にメッセージを消す
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました')
      console.error('投稿エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Qiita 記事作成</h1>
        <div className="header-actions">
          <button
            className="save-draft-button"
            onClick={handleSaveDraft}
            title="下書きを保存"
          >
            {draftSaved ? '✓ 保存しました' : '下書き保存'}
          </button>
          <button
            className="clear-draft-button"
            onClick={handleClearDraft}
            title="下書きを削除"
          >
            下書き削除
          </button>
          <label className="private-checkbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>非公開</span>
          </label>
          <button
            className="publish-button"
            onClick={handlePublish}
            disabled={isLoading}
          >
            {isLoading ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="editor-container">
        <div className="editor-panel">
          <div className="panel-header">記事情報</div>
          <div className="article-form">
            <input
              type="text"
              className="title-input"
              placeholder="記事のタイトルを入力..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              className="tags-input"
              placeholder="タグをカンマ区切りで入力（例: JavaScript,React,TypeScript）"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="panel-header">マークダウン</div>
          <textarea
            className="markdown-editor"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="マークダウンを記入してください..."
          />
        </div>
        <div className="preview-panel">
          <div className="panel-header">プレビュー</div>
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
