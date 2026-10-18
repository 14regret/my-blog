import { useEffect, useState } from 'react'
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
  
  // 点赞状态
  const [hasLiked, setHasLiked] = useState(false)

  const currentUsername = localStorage.getItem('username')
  const isAdmin = currentUsername === 'admin'

  useEffect(() => {
    // 【修复警告】使用 setTimeout 将 setState 变成异步，避开 React 严格模式的同步渲染警告
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

    return () => clearTimeout(timer) // 组件卸载时清理定时器
  }, [id])

  const handleLike = () => {
    if (hasLiked) return alert("你已经点过赞啦！")
    
    request.put(`/posts/${id}/like`).then(res => {
      setPost(res.data)
      setHasLiked(true)
      
      // 记录到本地
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      likedPosts.push(Number(id))
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
    }).catch(err => console.error(err))
  }

  const handleDelete = () => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      request.delete(`/posts/${id}`)
        .then(() => {
          alert("删除成功！")
          navigate('/')
        })
        .catch(err => {
          console.error("删除失败:", err)
          alert(err.response?.data || "删除失败")
        })
    }
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentAuthor.trim() || !commentContent.trim()) {
      return alert("请填写昵称和评论内容！")
    }
    request.post(`/posts/${id}/comments`, {
      author: commentAuthor,
      content: commentContent
    }).then(res => {
      setComments([res.data, ...comments])
      setCommentContent('')
      alert("评论成功！")
    }).catch(err => {
      console.error(err)
      alert("评论失败！")
    })
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm("确定要删除这条评论吗？")) {
      request.delete(`/comments/${commentId}`)
        .then(() => {
          setComments(comments.filter(c => c.id !== commentId))
        })
        .catch(err => console.error("删除失败:", err))
    }
  }

  if (!post) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#fff' }}>文章加载中...</h2>

  const canModify = isAdmin || (currentUsername && currentUsername === post.author);

  return (
    <div className="container">
      {canModify && (
        <div className="header" style={{ justifyContent: 'flex-end' }}>
          <div>
            <Link to={`/edit/${post.id}`} className="btn btn-warning">✏️ 编辑</Link>
            <button onClick={handleDelete} className="btn btn-danger">🗑️ 删除</button>
          </div>
        </div>
      )}
      
      <h1 style={{ fontSize: '32px', color: '#fff', marginBottom: '10px', marginTop: 0 }}>{post.title}</h1>
      
      <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '14px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span>作者: {post.author}</span>
        <span>发布于: {new Date(post.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
        <span>👁️ {post.views || 0} 阅读</span> {/* 新增阅读量 */}
        {post.category && <span style={{ color: '#ff6b9e' }}>📁 {post.category}</span>}
        {post.tags && (
          <span style={{ display: 'flex', gap: '5px' }}>
            🏷️ {post.tags.split(',').map(t => (
              <span key={t} style={{ background: 'rgba(100, 255, 218, 0.1)', color: '#64ffda', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{t}</span>
            ))}
          </span>
        )}
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* 点赞区域 */}
      <div style={{ textAlign: 'center', margin: '50px 0' }}>
        <button 
          onClick={handleLike} 
          disabled={hasLiked}
          style={{ 
            background: 'none', border: 'none', cursor: hasLiked ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto'
          }}
        >
          <div style={{ 
            fontSize: '40px', 
            filter: hasLiked ? 'none' : 'grayscale(100%)', 
            transition: 'transform 0.2s',
            transform: hasLiked ? 'scale(1.1)' : 'scale(1)'
          }}>
            ❤️
          </div>
          <span style={{ color: hasLiked ? '#ff6b9e' : '#94a3b8', fontSize: '14px', marginTop: '5px' }}>
            {post.likes || 0} 人点赞
          </span>
        </button>
      </div>

      {/* 评论区 */}
      <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <h3 style={{ color: '#fff' }}>💬 评论区 ({comments.length})</h3>
        
        <form onSubmit={handleCommentSubmit} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="你的昵称" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)}
              style={{ width: '200px', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', outline: 'none' }} />
          </div>
          <textarea placeholder="说点什么吧..." value={commentContent} onChange={e => setCommentContent(e.target.value)} rows="3"
            style={{ width: '100%', padding: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none', resize: 'vertical' }}></textarea>
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
  )
}