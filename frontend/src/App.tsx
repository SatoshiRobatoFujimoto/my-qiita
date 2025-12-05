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
  const [drafts, setDrafts] = useState<DraftData[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // 下書き一覧を取得
  const loadDraftsList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/list`)
      if (response.ok) {
        const draftsList: DraftData[] = await response.json()
        setDrafts(draftsList)
      }
    } catch (err) {
      console.error('下書き一覧の取得に失敗しました:', err)
    }
  }

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
    loadDraftsList()
  }, [])

  // 下書きを読み込む
  const handleLoadDraft = async (draftId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`)
      if (response.ok) {
        const draft: DraftData = await response.json()
        setTitle(draft.title || '')
        setTags(draft.tags || '')
        setMarkdown(draft.markdown || '')
        setIsPrivate(draft.isPrivate || false)
        setCurrentDraftId(draft.id || null)
        setSuccess('下書きを読み込みました')
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      }
    } catch (err) {
      setError('下書きの読み込みに失敗しました')
      console.error('下書き読み込みエラー:', err)
    }
  }

  // 下書きを削除する関数（サイドメニューから）
  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('この下書きを削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('下書きの削除に失敗しました')
      }

      // 削除した下書きが現在編集中の下書きの場合は、エディタをクリア
      if (currentDraftId === draftId) {
        setTitle('')
        setTags('')
        setMarkdown('')
        setIsPrivate(false)
        setCurrentDraftId(null)
      }

      // 一覧を再取得
      await loadDraftsList()
      setSuccess('下書きを削除しました')
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError('下書きの削除に失敗しました')
      console.error('下書き削除エラー:', err)
    }
  }

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
      
      // 一覧を再取得
      await loadDraftsList()
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
    
    // 一覧を再取得
    await loadDraftsList()
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
      
      // 一覧を再取得
      await loadDraftsList()
      
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

  // 新規記事を作成
  const handleNewArticle = () => {
    if (title || tags || markdown || currentDraftId) {
      if (!confirm('現在編集中の内容を破棄して新規記事を作成しますか？')) {
        return
      }
    }
    
    setTitle('')
    setTags('')
    setMarkdown(`# タイトル

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
    setIsPrivate(false)
    setCurrentDraftId(null)
    setSuccess('新規記事を作成しました')
    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  // 日付をフォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          <h1>Qiita 記事作成</h1>
        </div>
        <div className="header-actions">
          <button
            className="new-article-button"
            onClick={handleNewArticle}
            title="新規記事を作成"
          >
            + 新規作成
          </button>
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

      <div className="alert-container">
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
      </div>

      <div className="main-content">
        {isSidebarOpen && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>下書き一覧</h2>
              <button
                className="refresh-button"
                onClick={loadDraftsList}
                title="一覧を更新"
              >
                🔄
              </button>
            </div>
            <div className="drafts-list">
              {drafts.length === 0 ? (
                <div className="drafts-empty">下書きがありません</div>
              ) : (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={`draft-item ${currentDraftId === draft.id ? 'active' : ''}`}
                    onClick={() => draft.id && handleLoadDraft(draft.id)}
                  >
                    <div className="draft-item-header">
                      <h3 className="draft-title">
                        {draft.title || '(タイトルなし)'}
                      </h3>
                      <button
                        className="draft-delete-button"
                        onClick={(e) => draft.id && handleDeleteDraft(draft.id, e)}
                        title="削除"
                      >
                        ×
                      </button>
                    </div>
                    <div className="draft-meta">
                      <span className="draft-date">
                        {formatDate(draft.updatedAt || draft.createdAt)}
                      </span>
                      {draft.isPrivate && (
                        <span className="draft-private">非公開</span>
                      )}
                    </div>
                    {draft.tags && (
                      <div className="draft-tags">
                        {draft.tags.split(',').slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="draft-tag">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
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
    </div>
  )
}

export default App
