import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Fuse from 'fuse.js'
import request from './axiosConfig'
import PostDetail from './PostDetail'
import PostEditor from './PostEditor'
import Login from './Login'
import Register from './Register'
import Navbar from './Navbar'
import Admin from './Admin'
import Archive from './Archive'
import MessageBoard from './MessageBoard'
import MusicPlayer from './MusicPlayer'
import './App.css'

const getPlainText = (markdown) => {
  if (!markdown) return ''
  let text = markdown.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[.*?\]\(.*?\)/g, '')
  text = text.replace(/[#*`>]/g, '')
  return text.substring(0, 80) + (text.length > 80 ? '...' : '')
}

function Home() {
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([]) // 用于搜索的全量数据
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  const [filterType, setFilterType] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')

  const pageSize = 5

  const fullSubtitle = "那些生死悲欢，你以为是人世一生，可月亮见得太多了，知道那只是沉埃一瞬。"
  const [displaySubtitle, setDisplaySubtitle] = useState('')
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (charIndex < fullSubtitle.length) {
      const timer = setTimeout(() => {
        setDisplaySubtitle(prev => prev + fullSubtitle[charIndex])
        setCharIndex(prev => prev + 1)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [charIndex, fullSubtitle])

  // 1. 初始化时拉取全量数据用于前端搜索
  useEffect(() => {
    request.get('/posts?page=0&size=999').then(res => {
      setAllPosts(res.data.content)
    }).catch(err => console.error(err))
  }, [])

  // 2. 页面展示逻辑
  useEffect(() => {
    if (keyword) {
      // 【搜索模式】使用 Fuse.js 进行前端高性能模糊搜索
      const fuse = new Fuse(allPosts, {
        keys: ['title', 'content', 'tags'], // 搜索的字段
        threshold: 0.4, // 容错率（0.4表示允许部分拼写错误）
        includeScore: true
      })
      const results = fuse.search(keyword).map(result => result.item)
      
      // 【修复】使用 setTimeout 将同步 setState 变成异步，消除 ESLint 警告
      const timer = setTimeout(() => {
        setPosts(results)
        setTotalPages(0) // 前端搜索不分页，直接全量展示
      }, 0)
      
      return () => clearTimeout(timer)
    } else {
      // 【常规浏览模式】走后端分页和分类标签筛选
      let url = `/posts?page=${page}&size=${pageSize}`
      if (filterType === 'category') url += `&category=${filterValue}`
      if (filterType === 'tag') url += `&tag=${filterValue}`

      request.get(url).then(res => {
        setPosts(res.data.content)
        setTotalPages(res.data.totalPages)
      }).catch(err => console.error(err))
    }
  }, [page, filterType, filterValue, keyword, allPosts])

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setFilterType('')
    setFilterValue('')
    setPage(0)
  }

  const handleFilter = (type, value) => {
    setFilterType(type)
    setFilterValue(value)
    setKeyword('')
    setSearchInput('')
    setPage(0)
  }

  const clearAllConditions = () => {
    setFilterType('')
    setFilterValue('')
    setKeyword('')
    setSearchInput('')
    setPage(0)
  }

  const titleText = "欢迎来到 Mxj 的博客";

  return (
    <>
      <div className="hero-section">
        <h1 className="hero-title">
          {titleText.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="hero-subtitle">
          {displaySubtitle}
          <span className="cursor"></span>
        </p>
      </div>

      <div className="masonry-grid">
        <div className="sidebar-column">
          <div className="glass-card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
              <h3 style={{ border: 'none', margin: 0, padding: 0, flexShrink: 0 }}>
                📚 {keyword ? `Fuse搜索: "${keyword}"` : filterType ? '筛选结果' : '最新文章列表'}
              </h3>
              
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
                <input 
                  type="text" 
                  placeholder="支持错别字全文搜索..." 
                  value={searchInput} 
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '13px', outline: 'none', width: '180px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>搜索</button>
              </form>
            </div>

            {(keyword || filterType) && (
              <div style={{ fontSize: '14px', marginBottom: '15px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  当前条件：<span style={{ color: '#64ffda' }}>{keyword ? `搜索 "${keyword}"` : filterValue}</span>
                </span>
                <button onClick={clearAllConditions} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>清空条件</button>
              </div>
            )}

            <ul className="article-list">
              {posts.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>没有找到相关文章...</p>
              ) : (
                posts.map(post => (
                  <li key={post.id}>
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                    <p>{getPlainText(post.content)}</p>
                    <small style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span>👤 {post.author}</span>
                      <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>👁️ {post.views || 0}</span>
                      {post.category && <span style={{ color: '#ff6b9e' }}>📁 {post.category}</span>}
                    </small>
                  </li>
                ))
              )}
            </ul>

            {/* 只有在非搜索模式下，才显示分页 */}
            {!keyword && totalPages > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <button className="btn btn-back" disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</button>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>第 {page + 1} / {totalPages} 页</span>
                <button className="btn btn-back" disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>下一页</button>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3>📢 站点公告</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
              欢迎来到我的小站！<br />
              你可以随意阅读文章，登录后还可以发布评论。
            </p>
          </div>
        </div>

        <div className="sidebar-column">
          <div className="glass-card">
            <h3>👋 关于我</h3>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, #ff6b9e, #64ffda)', margin: '0 auto 15px auto' }}></div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                一个普普通通的牛马的全栈开发者，目前正在努力变强中！
              </p>
            </div>
          </div>

          <div className="glass-card">
            <h3>🧭 快捷导航</h3>
            <ul className="side-menu" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}><Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>🏠 首页</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/archive" style={{ color: '#cbd5e1', textDecoration: 'none' }}>📅 文章归档</Link></li>
              <li>
                <a href="http://localhost:8080/rss.xml" target="_blank" rel="noreferrer" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 'bold' }}>
                  📡 RSS 订阅
                </a>
              </li>
            </ul>
          </div>

          <div className="glass-card">
            <h3>📁 文章分类</h3>
            <div className="tags">
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => handleFilter('category', '技术分享')}>技术分享</span>
              <span className="tag tag-pink" style={{ cursor: 'pointer' }} onClick={() => handleFilter('category', '生活随笔')}>生活随笔</span>
              <span className="tag tag-yellow" style={{ cursor: 'pointer' }} onClick={() => handleFilter('category', '二次元')}>二次元</span>
            </div>
          </div>

          <div className="glass-card">
            <h3>🏷️ 热门标签</h3>
            <div className="tags">
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => handleFilter('tag', 'Java')}>Java</span>
              <span className="tag tag-pink" style={{ cursor: 'pointer' }} onClick={() => handleFilter('tag', 'React')}>React</span>
              <span className="tag" style={{ cursor: 'pointer' }} onClick={() => handleFilter('tag', '前端')}>前端</span>
            </div>
          </div>

          <div className="glass-card" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#64ffda', textShadow: '0 0 10px rgba(100, 255, 218, 0.5)' }}>
              ONLINE
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>系统运行良好</p>
          </div>
        </div>

      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/editor" element={<PostEditor />} />
        <Route path="/edit/:id" element={<PostEditor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/message" element={<MessageBoard />} />
      </Routes>
    </BrowserRouter>
  )
}