import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

export default function MessageBoard() {
  const [messages, setMessages] = useState([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const isAdmin = localStorage.getItem('username') === 'admin'

  // 【修复】直接把请求写在 useEffect 内部，解决报错
  useEffect(() => {
    request.get('/messages')
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return alert("请填写昵称和留言内容！")
    
    request.post('/messages', { author, content }).then(res => {
      // 提交成功后，把新留言插到列表最前面
      setMessages([res.data, ...messages])
      setContent('')
      alert("留言成功！")
    }).catch(err => console.error(err))
  }

  const handleDelete = (id) => {
    if (window.confirm("确定要删除这条留言吗？")) {
      request.delete(`/messages/${id}`).then(() => {
        // 删除成功后，过滤掉这条留言
        setMessages(messages.filter(m => m.id !== id))
      }).catch(err => console.error(err))
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>💬 留言板</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>
      
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>在这里留下你想说的话吧，无需登录即可留言。</p>

      {/* 留言输入区 */}
      <form onSubmit={handleSubmit} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="你的昵称" value={author} onChange={e => setAuthor(e.target.value)}
            style={{ width: '200px', padding: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', outline: 'none' }} />
        </div>
        <textarea placeholder="写下你想说的话..." value={content} onChange={e => setContent(e.target.value)} rows="3"
          style={{ width: '100%', padding: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '15px', outline: 'none', resize: 'vertical' }}></textarea>
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 30px' }}>发送留言</button>
      </form>

      {/* 留言列表 */}
      <div>
        {messages.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>还没有人留言，快来抢占一楼吧！</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '15px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#64ffda', fontSize: '16px' }}>👤 {msg.author}</p>
                {isAdmin && (
                  <button onClick={() => handleDelete(msg.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>删除</button>
                )}
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>{msg.content}</p>
              <small style={{ color: '#64748b' }}>{new Date(msg.createdAt).toLocaleString('zh-CN', { hour12: false })}</small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}