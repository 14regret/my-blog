import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  
  const [announcement, setAnnouncement] = useState('')
  const [showBanner, setShowBanner] = useState(true)
  
  // 【新增】未读消息状态
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    request.get('/config/announcement').then(res => {
      if (res.data.announcement) {
        setAnnouncement(res.data.announcement)
        const hidden = localStorage.getItem('hidden_announcement')
        if (hidden === res.data.announcement) setShowBanner(false)
      }
    }).catch(err => console.error(err))

    // 【新增】如果登录了，每 10 秒轮询一次未读消息数量
    if (username) {
      const fetchUnread = () => {
        request.get('/notifications/unread-count')
          .then(res => setUnreadCount(res.data))
          .catch(err => console.error(err))
      }
      fetchUnread() // 初始拉取一次
      const interval = setInterval(fetchUnread, 10000)
      return () => clearInterval(interval)
    }
  }, [username])

  const closeBanner = () => { setShowBanner(false); localStorage.setItem('hidden_announcement', announcement) }
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('username'); navigate('/'); window.location.reload() }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
      {announcement && showBanner && (
        <div style={{ background: 'linear-gradient(90deg, #ff6b9e, #64ffda)', color: '#111', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
          <div style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📢 公告：{announcement}</span></div>
          <button onClick={closeBanner} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#111' }}>✕</button>
        </div>
      )}

      <nav className="navbar" style={{ position: 'relative', top: 'auto' }}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">✍️ Mxj 的博客</Link>
          <div className="navbar-links" style={{ alignItems: 'center', display: 'flex' }}>
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>首页</Link>
            <Link to="/archive" className={`nav-item ${location.pathname === '/archive' ? 'active' : ''}`}>归档</Link>
            <Link to="/links" className={`nav-item ${location.pathname === '/links' ? 'active' : ''}`}>友链</Link>
            <Link to="/message" className={`nav-item ${location.pathname === '/message' ? 'active' : ''}`}>留言板</Link>
            <Link to="/editor" className={`nav-item ${location.pathname === '/editor' ? 'active' : ''}`}>写文章</Link>
            
            {username && (
              <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: '#ffc107' }}>⚙️ 后台管理</Link>
            )}
            
            {username ? (
              <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                
                {/* 【新增】消息小铃铛 */}
                <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none', fontSize: '18px' }} title="消息中心">
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ 
                      position: 'absolute', top: '-5px', right: '-10px', 
                      background: '#ef4444', color: '#fff', fontSize: '10px', 
                      padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' 
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} style={{ color: '#64ffda', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none' }}>
                  👤 {username}
                </Link>
                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px' }}>退出</button>
              </div>
            ) : (
              <div style={{ marginLeft: '20px' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '10px' }}>登录</Link>
                <Link to="/register" className="btn btn-warning" style={{ padding: '6px 12px', fontSize: '13px' }}>注册</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}