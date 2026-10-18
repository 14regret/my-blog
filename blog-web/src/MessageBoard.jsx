import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

export default function MessageBoard() {
  const [messages, setMessages] = useState([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const isAdmin = localStorage.getItem('username') === 'admin'

  useEffect(() => {
    request.get('/messages')
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return alert("请填写昵称和留言内容！")
    
    request.post('/messages', { author, content }).then(res => {
      setMessages([res.data, ...messages])
      setContent('')
      alert("留言成功！")
    }).catch(err => console.error(err))
  }

  const handleDelete = (id) => {
    if (window.confirm("确定要删除这条留言吗？")) {
      request.delete(`/messages/${id}`).then(() => {
        setMessages(messages.filter(m => m.id !== id))
      }).catch(err => console.error(err))
    }
  }

  return (
    <div className="danmaku-container">
      {/* 1. 落叶飘落特效层 */}
      <div className="leaf-shower">
        <div className="leaf" style={{ left: '10%', animationDelay: '0s', animationDuration: '12s', fontSize: '24px' }}>🍁</div>
        <div className="leaf" style={{ left: '25%', animationDelay: '2s', animationDuration: '15s', fontSize: '20px' }}>🍂</div>
        <div className="leaf" style={{ left: '40%', animationDelay: '1s', animationDuration: '10s', fontSize: '18px' }}>🍃</div>
        <div className="leaf" style={{ left: '55%', animationDelay: '4s', animationDuration: '18s', fontSize: '26px' }}>🍁</div>
        <div className="leaf" style={{ left: '70%', animationDelay: '0.5s', animationDuration: '14s', fontSize: '22px' }}>🍂</div>
        <div className="leaf" style={{ left: '85%', animationDelay: '3s', animationDuration: '16s', fontSize: '20px' }}>🍃</div>
        <div className="leaf" style={{ left: '95%', animationDelay: '5s', animationDuration: '11s', fontSize: '24px' }}>🍁</div>
        <div className="leaf" style={{ left: '5%', animationDelay: '6s', animationDuration: '17s', fontSize: '18px' }}>🍂</div>
        <div className="leaf" style={{ left: '60%', animationDelay: '7s', animationDuration: '13s', fontSize: '22px' }}>🍁</div>
        <div className="leaf" style={{ left: '30%', animationDelay: '8s', animationDuration: '19s', fontSize: '20px' }}>🍃</div>
      </div>

      {/* 2. 弹幕层 */}
      <div className="danmaku-layer">
        {messages.map((msg, index) => {
          const topPosition = 15 + ((index * 7) % 60)
          
          // 【修改】速度降低一半：原本是 12~22秒，现在改成 24~34秒
          const duration = 24 + (index % 5) * 4 
          const delay = index * 3

          return (
            <div 
              key={msg.id} 
              className="danmaku-item"
              style={{ 
                top: `${topPosition}%`, 
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
              }}
            >
              <span className="danmaku-author">👤 {msg.author}: </span>
              <span className="danmaku-content">{msg.content}</span>
              {isAdmin && (
                <button onClick={() => handleDelete(msg.id)} className="danmaku-delete">X</button>
              )}
            </div>
          )
        })}
      </div>

      {/* 3. 底部操作面板 */}
      <div className="danmaku-control-panel">
        <div className="header" style={{ marginBottom: '15px', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>💬 全屏留言弹幕</h2>
          <Link to="/" className="btn btn-back">← 返回首页</Link>
        </div>
        
        <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '15px' }}>
          发送的留言会化作弹幕飘过屏幕，无需登录即可发送。
        </p>

        <form onSubmit={handleSubmit} className="danmaku-form">
          <input 
            type="text" 
            placeholder="你的昵称" 
            value={author} 
            onChange={e => setAuthor(e.target.value)}
            className="danmaku-input" 
            style={{ width: '150px', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="写下你想说的话..." 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="danmaku-input" 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', backgroundColor: '#ff6b9e' }}>
              发射弹幕
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}