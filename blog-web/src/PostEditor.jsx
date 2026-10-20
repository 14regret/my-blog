import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import request from './axiosConfig'
import MDEditor from '@uiw/react-md-editor'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('Admin')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('技术分享')
  const [tags, setTags] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const [saveStatus, setSaveStatus] = useState('')
  const [currentId, setCurrentId] = useState(id)
  const isTouched = useRef(false)

  const [showHistory, setShowHistory] = useState(false)
  const [revisions, setRevisions] = useState([])

  const handleContentChange = (val) => {
    setContent(val)
    isTouched.current = true
  }

  const handleAutoSave = () => {
    setSaveStatus('saving')
    const postData = { title, author, content, category, tags, isDraft: true, scheduledTime: null }

    if (currentId) {
      request.put(`/posts/${currentId}`, postData).then(() => {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(''), 2000)
      }).catch(err => { console.error(err); setSaveStatus('') })
    } else {
      request.post('/posts', postData).then(res => {
        setCurrentId(res.data.id)
        setIsDraft(true)
        window.history.replaceState(null, '', `/edit/${res.data.id}`)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(''), 2000)
      }).catch(err => { console.error(err); setSaveStatus('') })
    }
  }

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => setCurrentId(id), 0)
      request.get(`/posts/${id}`).then(res => {
        setTitle(res.data.title)
        setAuthor(res.data.author)
        setContent(res.data.content)
        setCategory(res.data.category || '技术分享')
        setTags(res.data.tags || '')
        setIsDraft(res.data.isDraft || false)
        if (res.data.scheduledTime) {
          setScheduledTime(res.data.scheduledTime.substring(0, 16))
        }
      }).catch(err => console.error("获取文章失败:", err))
      return () => clearTimeout(timer)
    }
  }, [id])

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const token = localStorage.getItem('token')
      if (token && isTouched.current && title.trim() !== '') handleAutoSave()
    }, 30000)
    return () => clearInterval(autoSaveInterval)
  }, [title, content, category, tags]) 

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    request.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
      setUploading(false)
      if (res.data.url) {
        const cursorPosition = textareaRef.current ? textareaRef.current.selectionStart : content.length
        const textBefore = content.substring(0, cursorPosition)
        const textAfter = content.substring(cursorPosition)
        handleContentChange(textBefore + `\n![图片](${res.data.url})\n` + textAfter)
      }
    }).catch(err => {
      setUploading(false)
      console.error("图片上传失败:", err)
      alert("图片上传失败！")
    })
    e.target.value = null
  }

  const handleSubmit = (type) => {
    if (!title) return alert("标题不能为空！")
    
    const isScheduling = type === 'scheduled';
    if (isScheduling && !scheduledTime) return alert("请选择定时发布时间！")
    if (type === false && !content) return alert("正文内容不能为空！")

    const postData = { 
      title, 
      author, 
      content, 
      category, 
      tags, 
      isDraft: isScheduling ? true : type,
      scheduledTime: isScheduling ? scheduledTime + ":00" : null
    }
    
    const targetId = currentId || id

    if (targetId) {
      request.put(`/posts/${targetId}`, postData).then(() => {
        alert(isScheduling ? "已设置定时发布！" : (type ? "已保存草稿！" : "发布成功！"))
        navigate(isScheduling || type ? '/admin' : `/post/${targetId}`)
      }).catch(err => {
        console.error("提交失败:", err)
        alert("操作失败，可能是未登录或网络异常")
      })
    } else {
      request.post('/posts', postData).then((res) => {
        alert(isScheduling ? "已设置定时发布！" : (type ? "已保存草稿！" : "发布成功！"))
        navigate(isScheduling || type ? '/admin' : `/post/${res.data.id}`)
      }).catch(err => {
        console.error("提交失败:", err)
        alert("操作失败，可能是未登录或网络异常")
      })
    }
  }

  const openHistory = () => {
    if (!currentId) return alert("请先保存文章后才能查看历史版本")
    request.get(`/posts/${currentId}/revisions`).then(res => { setRevisions(res.data); setShowHistory(true) }).catch(err => console.error(err))
  }

  const restoreRevision = (rev) => {
    if (window.confirm("确定要恢复该历史版本吗？")) {
      setTitle(rev.title); setContent(rev.content); setCategory(rev.category); setTags(rev.tags); setShowHistory(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1>{id ? '✏️ 编辑文章' : '📝 发布新文章'}</h1>
          {isDraft && <span style={{color: '#f59e0b', fontSize: '16px'}}>(草稿)</span>}
          {saveStatus === 'saving' && <span style={{ color: '#64ffda', fontSize: '14px' }}>💾 正在自动保存...</span>}
          {saveStatus === 'saved' && <span style={{ color: '#10b981', fontSize: '14px' }}>✅ 已自动保存</span>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {id && <button onClick={openHistory} className="btn btn-back" style={{ padding: '6px 15px' }}>🕰️ 历史版本</button>}
          <Link to="/" className="btn btn-back">← 返回首页</Link>
        </div>
      </div>
      
      <div className="form-group">
        <label>文章标题：</label>
        <input type="text" value={title} onChange={e => { setTitle(e.target.value); isTouched.current = true }} placeholder="输入标题..." />
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>文章分类：</label>
          <select value={category} onChange={e => { setCategory(e.target.value); isTouched.current = true }} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <option value="技术分享">技术分享</option>
            <option value="生活随笔">生活随笔</option>
            <option value="二次元">二次元</option>
            <option value="未分类">未分类</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label>文章标签 (用英文逗号分隔)：</label>
          <input type="text" value={tags} onChange={e => { setTags(e.target.value); isTouched.current = true }} placeholder="例如：Java,React,前端" />
        </div>
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ margin: 0 }}>正文内容 (支持 Markdown 实时预览)：</label>
          <div>
            <input type="file" accept="image/*" id="image-upload" style={{ display: 'none' }} onChange={handleImageUpload} />
            <label htmlFor="image-upload" className="btn btn-warning" style={{ cursor: 'pointer', margin: 0, padding: '5px 10px', fontSize: '12px' }}>
              {uploading ? '上传中...' : '🖼️ 插入图片'}
            </label>
          </div>
        </div>
        <div data-color-mode="dark">
          <MDEditor value={content} onChange={handleContentChange} height={600} textareaProps={{ ref: textareaRef, placeholder: '开始创作吧...' }} />
        </div>
      </div>
      
      <div className="form-group" style={{ marginTop: '20px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
        <label style={{ color: '#fcd34d' }}>⏰ 定时发布（到点后自动公开发布）：</label>
        <input 
          type="datetime-local" 
          value={scheduledTime} 
          onChange={e => setScheduledTime(e.target.value)}
          style={{ width: '250px', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', colorScheme: 'dark' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button type="button" onClick={() => handleSubmit(true)} className="btn btn-warning" style={{ flex: 1, padding: '12px', fontSize: '16px' }}>💾 存为草稿</button>
        <button type="button" onClick={() => handleSubmit('scheduled')} className="btn btn-warning" style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: '#f59e0b', color: '#fff' }}>⏰ 定时发布</button>
        <button type="button" onClick={() => handleSubmit(false)} className="btn btn-primary" style={{ flex: 2, padding: '12px', fontSize: '16px' }}>🚀 立即发布</button>
      </div>

      {showHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: '#1a1a1a', transform: 'translateX(-15vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>🕰️ 历史版本记录</h3>
              <button onClick={() => setShowHistory(false)} className="btn btn-danger" style={{ padding: '4px 10px' }}>关闭</button>
            </div>
            {revisions.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>暂无历史版本。</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {revisions.map(rev => (
                  <li key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div>
                      <div style={{ color: '#64ffda', fontWeight: 'bold' }}>{rev.title}</div>
                      <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>保存于: {new Date(rev.createdAt).toLocaleString('zh-CN', { hour12: false })}</div>
                    </div>
                    <button onClick={() => restoreRevision(rev)} className="btn btn-warning" style={{ padding: '4px 12px', fontSize: '13px' }}>恢复此版本</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}