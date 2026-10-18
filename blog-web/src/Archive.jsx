import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

export default function Archive() {
  const [groupedPosts, setGroupedPosts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 拉取所有文章（假定最大1000篇）
    request.get('/posts?page=0&size=1000')
      .then(res => {
        const posts = res.data.content
        // 按 年-月 分组
        const grouped = posts.reduce((acc, post) => {
          const date = new Date(post.createdAt)
          const key = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
          if (!acc[key]) acc[key] = []
          acc[key].push(post)
          return acc
        }, {})
        setGroupedPosts(grouped)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <div className="header">
        <h1>📅 文章归档</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>
      
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>加载中...</p>
      ) : (
        <div style={{ padding: '10px 20px' }}>
          {Object.keys(groupedPosts).map(month => (
            <div key={month} style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#64ffda', fontSize: '24px', borderBottom: '1px solid rgba(100,255,218,0.3)', paddingBottom: '10px', marginBottom: '15px' }}>
                {month}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {groupedPosts[month].map(post => (
                  <li key={post.id} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'monospace' }}>
                        {new Date(post.createdAt).getDate().toString().padStart(2, '0')}日
                      </span>
                      <Link to={`/post/${post.id}`} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#ff6b9e'} onMouseOut={e => e.target.style.color = '#e2e8f0'}>
                        {post.title}
                      </Link>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>👁️ {post.views || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}