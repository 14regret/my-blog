import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

export default function FriendLinks() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    document.title = '友情链接 - Mxj 的博客'
    request.get('/friend-links').then(res => setLinks(res.data)).catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <div className="header">
        <h1>🔗 友情链接</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>
      
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>海内存知己，天涯若比邻。欢迎各位大佬交换友链！</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {links.length === 0 ? (
          <p style={{ color: '#64748b' }}>暂无友链，快去后台添加吧~</p>
        ) : (
          links.map(link => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noreferrer"
              className="glass-card"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none',
                opacity: link.isOnline ? 1 : 0.5, // 离线的变暗
                border: link.isOnline ? '1px solid rgba(100,255,218,0.3)' : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {link.avatar ? (
                <img src={link.avatar} alt={link.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🌐</div>
              )}
              
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {link.name}
                  {link.isOnline ? (
                    <span style={{ fontSize: '12px', color: '#10b981' }}>🟢 在线</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>🔴 离线</span>
                  )}
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {link.description || '这个站长很懒，什么都没写'}
                </p>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}