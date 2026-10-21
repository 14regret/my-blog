import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize' // 【新增】

// 常用表情库
const EMOJIS = ['😀','😂','🤣','😊','😍','🥰','😎','🤔','😭','😡','🥳','🤯','😴','👻','💩','👍','👎','👏','🙏','❤️','💔','⭐','🔥','🎉','💯','✨','🎈','🌹','🍺','🍉']

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [replyTo, setReplyTo] = useState(null) 
  
  const [hasLiked, setHasLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [toc, setToc] = useState([])
  const [activeId, setActiveId] = useState('')
  const contentRef = useRef(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])

  const [readProgress, setReadProgress] = useState(0)
  const [isImmersive, setIsImmersive] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('articleFontSize')) || 17)

  // 【新增】表情面板显示状态
  const [showEmoji, setShowEmoji] = useState(false)

  const currentUsername = localStorage.getItem('username')
  const isAdmin = currentUsername === 'admin'

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    const timer = setTimeout(() => setHasLiked(likedPosts.includes(Number(id))), 0)

    request.get(`/posts/${id}`).then(res => {
      setPost(res.data)
      document.title = `${res.data.title} - Mxj 的博客`
    }).catch(err => console.error(err))

    request.get(`/posts/${id}/comments`).then(res => setComments(res.data)).catch(err => console.error(err))
    request.get(`/posts/${id}/related`).then(res => setRelatedPosts(res.data)).catch(err => console.error(err))

    if (currentUsername) {
      request.get(`/favorites/${id}/check`).then(res => setIsFavorited(res.data)).catch(err => console.error(err))
    }

    return () => clearTimeout(timer)
  }, [id, currentUsername])

  useEffect(() => {
    return () => { document.title = 'Mxj 的博客 - 记录生活与技术' }
  }, [])

  useEffect(() => {
    if (!post || !contentRef.current) return
    const headers = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4'))
    let tocData = headers.map((header, index) => {
      const headingId = header.id || `heading-${index}`
      header.id = headingId
      return { id: headingId, text: header.innerText, level: header.tagName.toLowerCase() }
    })
    if (tocData.length === 0) {
      tocData = [{ id: 'post-title', text: '文章标题', level: 'h2' }, { id: 'post-content', text: '正文内容', level: 'h2' }, { id: 'post-comments', text: '前往评论区', level: 'h2' }]
    }
    setToc(tocData)

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setReadProgress((window.scrollY / totalHeight) * 100)
      let currentId = ''
      for (let header of headers) {
        if (header.getBoundingClientRect().top <= 120) currentId = header.id
        else break
      }
      if (currentId) setActiveId(currentId)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post])

  const scrollToHeading = (e, headingId) => {
    e.preventDefault()
    const element = document.getElementById(headingId)
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' })
      setActiveId(headingId)
    }
  }

  const changeFontSize = (delta) => {
    const newSize = Math.min(Math.max(14, fontSize + delta), 24)
    setFontSize(newSize)
    localStorage.setItem('articleFontSize', newSize)
  }

  // 【新增】插入表情
  const addEmoji = (emoji) => {
    setCommentContent(prev => prev + emoji)
    setShowEmoji(false)
    document.getElementById('comment-input')?.focus()
  }

  const handleFavorite = () => {
    if (!currentUsername) return alert("请先登录后再收藏！")
    request.post(`/favorites/${id}`).then(res => setIsFavorited(res.data)).catch(err => console.error(err))
  }

  const handleDelete = () => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      request.delete(`/posts/${id}`).then(() => { alert("删除成功！"); navigate('/'); }).catch(err => { console.error("删除失败:", err); alert(err.response?.data || "删除失败"); })
    }
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentAuthor.trim() || !commentContent.trim()) return alert("请填写昵称和评论内容！")
    const payload = { author: commentAuthor, content: commentContent }
    if (replyTo) payload.parentId = replyTo
    request.post(`/posts/${id}/comments`, payload).then(res => {
      setComments([res.data, ...comments])
      setCommentContent('')
      setReplyTo(null)
      alert("发表成功！")
    }).catch(err => { console.error(err); alert("失败！") })
  }

  const handleReplyClick = (commentId, author) => {
    setReplyTo(commentId)
    setCommentContent(`@${author} `)
    document.getElementById('comment-input')?.focus()
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm("确定要删除这条评论及它的所有回复吗？")) {
      request.delete(`/comments/${commentId}`).then(() => {
        setComments(comments.filter(c => c.id !== commentId && c.parentId !== commentId))
      }).catch(err => console.error(err))
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

  if (!post) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#fff' }}>文章加载中...</h2>

  const canModify = isAdmin || (currentUsername && currentUsername === post.author)
  const rootComments = comments.filter(c => !c.parentId)
  const getChildComments = (parentId) => comments.filter(c => c.parentId === parentId)

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, height: '3px', background: '#64ffda', width: `${readProgress}%`, zIndex: 99999, transition: 'width 0.1s' }} />

      <div className={`post-layout-container ${isImmersive ? 'immersive-mode' : ''}`}>
        <div className="post-main-content">
          <div className="container" style={{ margin: isImmersive ? '80px auto 40px auto' : '0 auto', maxWidth: isImmersive ? '900px' : 'none' }}>
            
            <div className="header" style={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', paddingBottom: 0 }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button onClick={() => setIsImmersive(!isImmersive)} className="btn btn-back" style={{ padding: '6px 12px' }}>{isImmersive ? '👀 退出沉浸模式' : '👀 沉浸阅读'}</button>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  <button onClick={() => changeFontSize(-1)} className="btn btn-back" style={{ padding: '2px 8px' }}>A-</button>
                  <span>{fontSize}px</span>
                  <button onClick={() => changeFontSize(1)} className="btn btn-back" style={{ padding: '2px 8px' }}>A+</button>
                </div>
              </div>

              {canModify && !isImmersive && (
                <div>
                  <Link to={`/edit/${post.id}`} className="btn btn-warning">✏️ 编辑</Link>
                  <button onClick={handleDelete} className="btn btn-danger">🗑️ 删除</button>
                </div>
              )}
            </div>
            
            <h1 id="post-title" style={{ fontSize: '32px', color: '#fff', marginBottom: '10px', marginTop: '20px' }}>{post.title}</h1>
            
            <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '14px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>作者: {post.author}</span>
              <span>发布于: {new Date(post.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
              <span>👁️ {post.views || 0} 阅读</span>
              {post.category && <span style={{ color: '#ff6b9e' }}>📁 {post.category}</span>}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

            <div className="post-content" id="post-content" ref={contentRef} style={{ fontSize: `${fontSize}px` }}>
              <ReactMarkdown
                rehypePlugins={[rehypeSanitize]} // 【新增】过滤危险的 HTML 标签
                components={{
                  img: (props) => <img {...props} style={{ cursor: 'zoom-in', maxWidth: '100%', borderRadius: '8px' }} onClick={() => setLightboxSrc(props.src)} alt={props.alt || '图片'} />
                }}

              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', margin: '50px 0' }}>
              <button onClick={handleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '40px', filter: isFavorited ? 'drop-shadow(0 0 10px #fcd34d)' : 'grayscale(100%)', transition: 'transform 0.2s', transform: isFavorited ? 'scale(1.1)' : 'scale(1)' }}>{isFavorited ? '⭐' : '☆'}</div>
                <span style={{ color: isFavorited ? '#fcd34d' : '#94a3b8', fontSize: '14px', marginTop: '5px' }}>{isFavorited ? '已收藏' : '收藏文章'}</span>
              </button>

              <button onClick={handleLike} disabled={hasLiked} style={{ background: 'none', border: 'none', cursor: hasLiked ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '40px', filter: hasLiked ? 'none' : 'grayscale(100%)', transition: 'transform 0.2s', transform: hasLiked ? 'scale(1.1)' : 'scale(1)' }}>❤️</div>
                <span style={{ color: hasLiked ? '#ff6b9e' : '#94a3b8', fontSize: '14px', marginTop: '5px' }}>{post.likes || 0} 人点赞</span>
              </button>
            </div>

            {relatedPosts.length > 0 && !isImmersive && (
              <div className="glass-card" style={{ margin: '30px 0', background: 'rgba(0,0,0,0.2)' }}>
                <h3 style={{ color: '#64ffda', marginTop: 0 }}>📖 相关推荐</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {relatedPosts.map(rp => (
                    <li key={rp.id} style={{ marginBottom: '10px' }}>
                      <Link to={`/post/${rp.id}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#ff6b9e', marginRight: '8px' }}>▹</span>{rp.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div id="post-comments" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <h3 style={{ color: '#fff' }}>💬 评论区 ({comments.length})</h3>
              <form onSubmit={handleCommentSubmit} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                {replyTo && (
                  <div style={{ background: 'rgba(100,255,218,0.1)', color: '#64ffda', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>正在回复...</span>
                    <button type="button" onClick={() => { setReplyTo(null); setCommentContent('') }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>取消回复</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" placeholder="你的昵称" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} style={{ width: '200px', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea id="comment-input" placeholder="说点什么吧..." value={commentContent} onChange={e => setCommentContent(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none', resize: 'vertical' }}></textarea>
                  
                  {/* 【新增】表情按钮与面板 */}
                  <div style={{ position: 'absolute', bottom: '20px', right: '10px' }}>
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', outline: 'none' }}>😀</button>
                    {showEmoji && (
                      <div className="emoji-picker">
                        {EMOJIS.map(e => (
                          <span key={e} onClick={() => addEmoji(e)} className="emoji-item">{e}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>发表评论</button>
              </form>

              <div>
                {rootComments.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>还没有评论，快来抢沙发吧！</p>
                ) : (
                  rootComments.map(c => (
                    <div key={c.id} style={{ padding: '15px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#60a5fa', fontSize: '15px' }}>👤 {c.author}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleReplyClick(c.id, c.author)} style={{ color: '#64ffda', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>回复</button>
                          {isAdmin && <button onClick={() => handleDeleteComment(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>删除</button>}
                        </div>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>{c.content}</p>
                      <small style={{ color: '#64748b' }}>{new Date(c.createdAt).toLocaleString('zh-CN', { hour12: false })}</small>

                      {getChildComments(c.id).length > 0 && (
                        <div style={{ marginLeft: '20px', marginTop: '15px', paddingLeft: '15px', borderLeft: '2px solid rgba(100,255,218,0.3)' }}>
                          {getChildComments(c.id).map(child => (
                            <div key={child.id} style={{ marginBottom: '15px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#ff6b9e', fontSize: '14px' }}>↳ {child.author}</p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button onClick={() => handleReplyClick(c.id, child.author)} style={{ color: '#64ffda', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>回复</button>
                                  {isAdmin && <button onClick={() => handleDeleteComment(child.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>删除</button>}
                                </div>
                              </div>
                              <p style={{ margin: '0 0 5px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5' }}>{child.content}</p>
                              <small style={{ color: '#475569', fontSize: '12px' }}>{new Date(child.createdAt).toLocaleString('zh-CN', { hour12: false })}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {!isImmersive && (
          <div className="toc-sidebar">
            {toc.length > 0 && (
              <div className="toc-container">
                <h4 className="toc-title">📑 文章目录</h4>
                <ul className="toc-list">
                  {toc.map(item => (
                    <li key={item.id} className={`toc-item toc-level-${item.level} ${activeId === item.id ? 'active' : ''}`}>
                      <a href={`#${item.id}`} onClick={(e) => scrollToHeading(e, item.id)}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <div onClick={() => setLightboxSrc(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, cursor: 'zoom-out' }}>
          <img src={lightboxSrc} alt="预览" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 30px rgba(255,255,255,0.2)' }} />
        </div>
      )}
    </>
  )
}