import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

export default function Profile() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    document.title = '个人中心 - Mxj 的博客'
    
    if (!username) {
      alert("请先登录！")
      navigate('/login')
      return
    }

    // 拉取收藏列表
    request.get('/favorites')
      .then(res => {
        setFavorites(res.data)
        setLoading(false)
      }).catch(err => {
        console.error("获取收藏失败:", err)
        setLoading(false)
      })
  }, [navigate, username])

  if (!username) return null

  return (
    <div className="container">
      <div className="header">
        <h1>👤 个人中心</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>

      <div className="glass-card" style={{ background: 'rgba(100, 255, 218, 0.05)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, #ff6b9e, #64ffda)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', color: '#fff', fontWeight: 'bold' }}>
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#fff' }}>你好, {username}!</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>欢迎回到你的专属空间，这里存放着你喜欢的内容。</p>
        </div>
      </div>

      <h3 style={{ color: '#64ffda', borderBottom: '1px solid rgba(100,255,218,0.2)', paddingBottom: '10px' }}>⭐ 我的收藏夹</h3>
      
      {loading ? (
        <p style={{ color: '#94a3b8' }}>加载中...</p>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>你的收藏夹空空如也~</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '15px' }}>去逛逛</Link>
        </div>
      ) : (
        <ul className="article-list" style={{ marginTop: '20px' }}>
          {favorites.map(fav => (
            <li key={fav.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/post/${fav.postId}`} style={{ fontSize: '18px', color: '#e2e8f0', textDecoration: 'none', fontWeight: 'bold' }}>
                  📄 文章 ID: {fav.postId}
                </Link>
                <span style={{ color: '#64748b', fontSize: '13px' }}>收藏于: {new Date(fav.createdAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}