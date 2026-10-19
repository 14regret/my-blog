import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'
import ReactMarkdown from 'react-markdown'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const navigate = useNavigate()

  const [comments, setComments] = useState([])
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [hasLiked, setHasLiked] = useState(false)

  // === TOC 目录相关状态 ===
  const [toc, setToc] = useState([])
  const [activeId, setActiveId] = useState('')
  const contentRef = useRef(null)

  const currentUsername = localStorage.getItem('username')
  const isAdmin = currentUsername === 'admin'

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    const timer = setTimeout(() => {
      setHasLiked(likedPosts.includes(Number(id)))
    }, 0)

    request.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("获取详情失败:", err))

    request.get(`/posts/${id}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error("获取评论失败:", err))

    return () => clearTimeout(timer)
  }, [id])

  // === 核心：生成目录 & 监听滚动高亮 ===
  useEffect(() => {
    if (!post || !contentRef.current) return

    // 1. 提取所有标题
    const headers = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4'))
    let tocData = headers.map((header, index) => {
      const headingId = header.id || `heading-${index}`
      header.id = headingId
      return {
        id: headingId,
        text: header.innerText,
        level: header.tagName.toLowerCase()
      }
    })

    // 【兜底逻辑】如果文章里没有写任何 Markdown 标题
    if (tocData.length === 0) {
      tocData = [
        { id: 'post-title', text: '文章标题', level: 'h2' },
        { id: 'post-content', text: '正文内容', level: 'h2' },
        { id: 'post-comments', text: '前往评论区', level: 'h2' }
      ]
    }

    setToc(tocData)

    // 2. 监听滚动，高亮当前所在的章节
    const handleScroll = () => {
      let currentId = ''
      
      if (tocData.length === 3 && tocData[0].id === 'post-title') {
        const titleEl = document.getElementById('post-title')
        const commentEl = document.getElementById('post-comments')
        
        if (commentEl && commentEl.getBoundingClientRect().top <= 120) {
          currentId = 'post-comments'
        } else if (titleEl && titleEl.getBoundingClientRect().top <= 120) {
          currentId = 'post-content'
        } else {
          currentId = 'post-title'
        }
      } else {
        for (let header of headers) {
          const rect = header.getBoundingClientRect()
          if (rect.top <= 120) {
            currentId = header.id
          } else {
            break
          }
        }
        if (!currentId && headers.length > 0) currentId = headers[0].id
      }
      
      if (currentId) setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [post])

  // === 点击目录平滑跳转 ===
  const scrollToHeading = (e, headingId) => {
    e.preventDefault()
    const element = document.getElementById(headingId)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveId(headingId)
    }
  }

  const handleLike = () => {
    if (hasLiked) return alert("你已经点过赞啦！")
    request.put(`/posts/${id}/like`).then(res => {
      setPost(res.data)
      setHasLiked(true)
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      likedPosts.push(Number(id))
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
    }).catch(err => console.error(err))
  }

  const handleDelete = () => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      request.delete(`/posts/${id}`).then(() => {
        alert("删除成功！")
        navigate('/')
      }).catch(err => {
        console.error("删除失败:", err)
        alert(err.response?.data || "删除失败")
      })
    }
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentAuthor.trim() || !commentContent.trim()) return alert("请填写昵称和评论内容！")
    request.post(`/posts/${id}/comments`, { author: commentAuthor, content: commentContent })
      .then(res => {
        setComments([res.data, ...comments])
        setCommentContent('')
        alert("评论成功！")
      }).catch(err => { console.error(err); alert("评论失败！") })
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm("确定要删除这条评论吗？")) {
      request.delete(`/comments/${commentId}`).then(() => {
        setComments(comments.filter(c => c.id !== commentId))
      }).catch(err => console.error("删除失败:", err))
    }
  }

  if (!post) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#fff' }}>文章加载中...</h2>

  const canModify = isAdmin || (currentUsername && currentUsername === post.author)

  return (
    <div className="post-layout-container">
      <div className="post-main-content">
        <div className="container" style={{ margin: '0 auto' }}>
          {canModify && (
            <div className="header" style={{ justifyContent: 'flex-end' }}>
              <div>
                <Link to={`/edit/${post.id}`} className="btn btn-warning">✏️ 编辑</Link>
                <button onClick={handleDelete} className="btn btn-danger">🗑️ 删除</button>
              </div>
            </div>
          )}
          
          <h1 id="post-title" style={{ fontSize: '32px', color: '#fff', marginBottom: '10px', marginTop: 0 }}>{post.title}</h1>
          
          <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '14px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>作者: {post.author}</span>
            <span>发布于: {new Date(post.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
            <span>👁️ {post.views || 0} 阅读</span>
            {post.category && <span style={{ color: '#ff6b9e' }}>📁 {post.category}</span>}
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

          <div className="post-content" id="post-content" ref={contentRef}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <div style={{ textAlign: 'center', margin: '50px 0' }}>
            <button onClick={handleLike} disabled={hasLiked} style={{ background: 'none', border: 'none', cursor: hasLiked ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
              <div style={{ fontSize: '40px', filter: hasLiked ? 'none' : 'grayscale(100%)', transition: 'transform 0.2s', transform: hasLiked ? 'scale(1.1)' : 'scale(1)' }}>❤️</div>
              <span style={{ color: hasLiked ? '#ff6b9e' : '#94a3b8', fontSize: '14px', marginTop: '5px' }}>{post.likes || 0} 人点赞</span>
            </button>
          </div>

          <div id="post-comments" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ color: '#fff' }}>💬 评论区 ({comments.length})</h3>
            <form onSubmit={handleCommentSubmit} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="你的昵称" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} style={{ width: '200px', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>
              <textarea placeholder="说点什么吧..." value={commentContent} onChange={e => setCommentContent(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none', resize: 'vertical' }}></textarea>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>发表评论</button>
            </form>

            <div>
              {comments.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>还没有评论，快来抢沙发吧！</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ padding: '15px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#60a5fa', fontSize: '15px' }}>👤 {c.author}</p>
                      {isAdmin && (
                        <button onClick={() => handleDeleteComment(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>删除</button>
                      )}
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>{c.content}</p>
                    <small style={{ color: '#64748b' }}>{new Date(c.createdAt).toLocaleString('zh-CN', { hour12: false })}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="toc-sidebar">
        {toc.length > 0 && (
          <div className="toc-container">
            <h4 className="toc-title">📑 文章目录</h4>
            <ul className="toc-list">
              {toc.map(item => (
                <li 
                  key={item.id} 
                  className={`toc-item toc-level-${item.level} ${activeId === item.id ? 'active' : ''}`}
                >
                  <a 
                    href={`#${item.id}`} 
                    onClick={(e) => scrollToHeading(e, item.id)}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
    </div>
  )
}