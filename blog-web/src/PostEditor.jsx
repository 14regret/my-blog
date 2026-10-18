import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import request from './axiosConfig'
import MDEditor from '@uiw/react-md-editor'

export default function PostEditor() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('Admin')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('技术分享')
  const [tags, setTags] = useState('')
  const [isDraft, setIsDraft] = useState(false) // 草稿状态
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const { id } = useParams()
  const textareaRef = useRef(null)

  useEffect(() => {
    if (id) {
      request.get(`/posts/${id}`)
        .then(res => {
          setTitle(res.data.title)
          setAuthor(res.data.author)
          setContent(res.data.content)
          setCategory(res.data.category || '技术分享')
          setTags(res.data.tags || '')
          setIsDraft(res.data.isDraft || false)
        })
        .catch(err => console.error("获取文章详情失败:", err))
    }
  }, [id])

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
        setContent(textBefore + `\n![图片](${res.data.url})\n` + textAfter)
      }
    }).catch(err => {
      setUploading(false)
      console.error(err)
      alert("图片上传失败！")
    })
    e.target.value = null
  }

  // 提交（带一个状态参数判断是存草稿还是发布）
  const handleSubmit = (draftStatus) => {
    if (!title) return alert("标题不能为空！")
    // 如果是正式发布，才校验正文
    if (!draftStatus && !content) return alert("正文内容不能为空！")

    const postData = { title, author, content, category, tags, isDraft: draftStatus }

    if (id) {
      request.put(`/posts/${id}`, postData).then(() => {
        alert(draftStatus ? "已保存草稿！" : "发布成功！")
        navigate(draftStatus ? '/admin' : `/post/${id}`)
      }).catch(err => {
        console.error(err)
        alert("操作失败，可能是未登录")
      })
    } else {
      request.post('/posts', postData).then(() => {
        alert(draftStatus ? "已保存草稿！" : "发布成功！")
        navigate(draftStatus ? '/admin' : '/')
      }).catch(err => {
        console.error(err)
        alert("操作失败，可能是未登录")
      })
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{id ? '✏️ 编辑文章' : '📝 发布新文章'} {isDraft && <span style={{color: '#f59e0b', fontSize: '16px'}}>(草稿)</span>}</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>
      
      <div className="form-group">
        <label>文章标题：</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="输入标题..." />
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>文章分类：</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <option value="技术分享">技术分享</option>
            <option value="生活随笔">生活随笔</option>
            <option value="二次元">二次元</option>
            <option value="未分类">未分类</option>
          </select>
        </div>
        
        <div className="form-group" style={{ flex: 2 }}>
          <label>文章标签 (用英文逗号分隔)：</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="例如：Java,React,前端" />
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
          <MDEditor value={content} onChange={setContent} height={600} textareaProps={{ ref: textareaRef, placeholder: '开始创作吧...' }} />
        </div>
      </div>
      
      {/* 底部双按钮 */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button type="button" onClick={() => handleSubmit(true)} className="btn btn-warning" style={{ flex: 1, padding: '12px', fontSize: '16px' }}>
          💾 存为草稿
        </button>
        <button type="button" onClick={() => handleSubmit(false)} className="btn btn-primary" style={{ flex: 2, padding: '12px', fontSize: '16px' }}>
          🚀 立即发布
        </button>
      </div>
    </div>
  )
}