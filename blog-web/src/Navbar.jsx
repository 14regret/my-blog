import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
    window.location.reload()
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">✍️ Mxj 的博客</Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>首页</Link>
          <Link to="/archive" className={`nav-item ${location.pathname === '/archive' ? 'active' : ''}`}>归档</Link>
          <Link to="/message" className={`nav-item ${location.pathname === '/message' ? 'active' : ''}`}>留言板</Link>
          <Link to="/editor" className={`nav-item ${location.pathname === '/editor' ? 'active' : ''}`}>写文章</Link>
          
          {username && (
            <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: '#ffc107' }}>
              ⚙️ 后台管理
            </Link>
          )}
          
          {username ? (
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
              <span style={{ marginRight: '12px', color: '#64ffda', fontSize: '14px', fontWeight: 'bold' }}>
                👤 {username}
              </span>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px' }}>退出</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>登录</Link>
              <Link to="/register" className="btn btn-warning" style={{ padding: '6px 12px', fontSize: '13px' }}>注册</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}