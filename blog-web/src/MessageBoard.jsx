import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

const EMOJIS = ['😀','😂','🤣','😊','😍','🥰','😎','🤔','😭','😡','🥳','🤯','😴','👻','💩','👍','👎','👏','🙏','❤️','💔','⭐','🔥','🎉','💯','✨','🎈','🌹','🍺','🍉']

export default function MessageBoard() {
  const [messages, setMessages] = useState([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const isAdmin = localStorage.getItem('username') === 'admin'

  // 【新增】表情面板状态
  const [showEmoji, setShowEmoji] = useState(false)

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
      setShowEmoji(false)
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

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji)
    setShowEmoji(false)
  }

  return (
    <div className="danmaku-container">
      <div className="leaf-shower">
        <div className="leaf" style={{ left: '10%', animationDelay: '0s', animationDuration: '12s', fontSize: '24px' }}>🍁</div>
        <div className="leaf" style={{ left: '25%', animationDelay: '2s', animationDuration: '15s', fontSize: '20px' }}>🍂</div>
        <div className="leaf" style={{ left: '40%', animationDelay: '1s', animationDuration: '10s', fontSize: '18px' }}>🍃</div>
        <div className="leaf" style={{ left: '55%', animationDelay: '4s', animationDuration: '18s', fontSize: '26px' }}>🍁</div>
        <div className="leaf" style={{ left: '70%', animationDelay: '0.5s', animationDuration: '14s', fontSize: '22px' }}>🍂</div>
        <div className="leaf" style={{ left: '85%', animationDelay: '3s', animationDuration: '16s', fontSize: '20px' }}>🍃</div>
        <div className="leaf" style={{ left: '95%', animationDelay: '5s', animationDuration: '11s', fontSize: '24px' }}>🍁</div>
      </div>

      <div className="danmaku-layer">
        {messages.map((msg, index) => {
          const topPosition = 15 + ((index * 7) % 60)
          const duration = 24 + (index % 5) * 4 
          const delay = index * 3

          return (
            <div key={msg.id} className="danmaku-item" style={{ top: `${topPosition}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
              <span className="danmaku-author">👤 {msg.author}: </span>
              <span className="danmaku-content">{msg.content}</span>
              {isAdmin && <button onClick={() => handleDelete(msg.id)} className="danmaku-delete">X</button>}
            </div>
          )
        })}
      </div>

      <div className="danmaku-control-panel">
        <div className="header" style={{ marginBottom: '15px', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>💬 全屏留言弹幕</h2>
          <Link to="/" className="btn btn-back">← 返回首页</Link>
        </div>
        
        <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '15px' }}>
          发送的留言会化作弹幕飘过屏幕，无需登录即可发送。
        </p>

        <form onSubmit={handleSubmit} className="danmaku-form">
          <input type="text" placeholder="你的昵称" value={author} onChange={e => setAuthor(e.target.value)} className="danmaku-input" style={{ width: '150px', marginBottom: '10px' }} />
          
          <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="写下你想说的话..." 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="danmaku-input" 
              style={{ flex: 1 }}
            />
            
            {/* 【新增】表情按钮与面板 */}
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 215, 0, 0.4)', borderRadius: '8px', width: '40px', height: '100%', cursor: 'pointer', outline: 'none' }}>😀</button>
              {showEmoji && (
                <div className="emoji-picker" style={{ bottom: '50px', right: '0' }}>
                  {EMOJIS.map(e => (
                    <span key={e} onClick={() => addEmoji(e)} className="emoji-item">{e}</span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', backgroundColor: '#ff6b9e' }}>发射弹幕</button>
          </div>
        </form>
      </div>
    </div>
  )
}