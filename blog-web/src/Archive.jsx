import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request from './axiosConfig'

export default function Archive() {
  const [groupedPosts, setGroupedPosts] = useState({})
  const [tagsCount, setTagsCount] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request.get('/posts?page=0&size=1000').then(res => {
      const posts = res.data.content
      
      // 1. 按 年-月 分组
      const grouped = posts.reduce((acc, post) => {
        const date = new Date(post.createdAt)
        const key = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
        if (!acc[key]) acc[key] = []
        acc[key].push(post)
        return acc
      }, {})
      setGroupedPosts(grouped)

      // 2. 统计所有标签的频次
      const tagMap = {}
      posts.forEach(post => {
        if (post.tags) {
          post.tags.split(',').forEach(tag => {
            const t = tag.trim()
            if (t) tagMap[t] = (tagMap[t] || 0) + 1
          })
        }
      })
      
      // 排序取前 20 个
      const sortedTags = Object.keys(tagMap)
        .map(name => ({ name, count: tagMap[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
      
      setTagsCount(sortedTags)
      setLoading(false)
    }).catch(err => console.error(err))
  }, [])

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="header">
        <h1>📅 文章归档与标签云</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>
      
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>加载中...</p>
      ) : (
        <>
          {/* 标签云区域 */}
          <div className="glass-card" style={{ marginBottom: '30px' }}>
            <h3>☁️ 热门标签云</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', padding: '10px 0' }}>
              {tagsCount.map(tag => {
                // 根据数量动态计算字体大小 (14px ~ 24px)
                const size = Math.min(24, 14 + tag.count * 2)
                return (
                  <Link 
                    key={tag.name} 
                    to={`/?tag=${encodeURIComponent(tag.name)}`}
                    style={{ 
                      color: '#64ffda', 
                      fontSize: `${size}px`, 
                      textDecoration: 'none',
                      textShadow: '0 0 10px rgba(100, 255, 218, 0.3)',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => e.target.style.color = '#ff6b9e'}
                    onMouseOut={e => e.target.style.color = '#64ffda'}
                  >
                    {tag.name} ({tag.count})
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 时间线区域 */}
          <div className="glass-card" style={{ padding: '10px 20px' }}>
            {Object.keys(groupedPosts).map(month => (
              <div key={month} style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#ff6b9e', fontSize: '20px', borderBottom: '1px solid rgba(255,107,158,0.3)', paddingBottom: '10px', marginBottom: '15px' }}>
                  {month}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {groupedPosts[month].map(post => (
                    <li key={post.id} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '14px', fontFamily: 'monospace' }}>
                          {new Date(post.createdAt).getDate().toString().padStart(2, '0')}日
                        </span>
                        <Link to={`/post/${post.id}`} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '16px', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = '#64ffda'} onMouseOut={e => e.target.style.color = '#e2e8f0'}>
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
        </>
      )}
    </div>
  )
}