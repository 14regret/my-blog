import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    document.title = '消息中心 - Mxj 的博客'
    if (!username) {
      alert("请先登录！")
      navigate('/login')
      return
    }

    request.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err))
  }, [navigate, username])

  const markAsRead = (id, postId) => {
    request.put(`/notifications/${id}/read`).then(() => {
      navigate(`/post/${postId}`)
    }).catch(err => console.error(err))
  }

  const markAllRead = () => {
    request.put('/notifications/read-all').then(() => {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    }).catch(err => console.error(err))
  }

  if (!username) return null

  return (
    <div className="container">
      <div className="header">
        <h1>🔔 消息中心</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={markAllRead} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '14px' }}>全部已读</button>
          <Link to="/" className="btn btn-back">← 返回首页</Link>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          <p>暂时没有收到任何消息哦~</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notifications.map(noti => (
            <li 
              key={noti.id} 
              onClick={() => markAsRead(noti.id, noti.postId)}
              className="glass-card"
              style={{ 
                marginBottom: '15px', cursor: 'pointer', padding: '20px',
                borderLeft: noti.isRead ? '4px solid transparent' : '4px solid #ff6b9e',
                opacity: noti.isRead ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#64ffda', fontWeight: 'bold' }}>
                  👤 {noti.sender} 
                  {!noti.isRead && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#fff', background: '#ef4444', padding: '2px 6px', borderRadius: '10px' }}>未读</span>}
                </span>
                <small style={{ color: '#64748b' }}>{new Date(noti.createdAt).toLocaleString('zh-CN', { hour12: false })}</small>
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>{noti.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}