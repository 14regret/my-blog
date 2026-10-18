import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const navigate = useNavigate()
  
  const currentUsername = localStorage.getItem('username')
  const isAdmin = currentUsername === 'admin'

  useEffect(() => {
    if (!currentUsername) {
      alert("请先登录！")
      navigate('/login')
      return
    }

    // 这里把后台拉取的文章数量放大，为了能看到草稿
    request.get('/posts?page=0&size=100')
      .then(res => setPosts(res.data.content))
      .catch(err => console.error(err))

    request.get('/comments')
      .then(res => setComments(res.data))
      .catch(err => console.error(err))
  }, [navigate, currentUsername])

  const handleDeletePost = (id) => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      request.delete(`/posts/${id}`).then(() => {
        setPosts(posts.filter(p => p.id !== id))
      }).catch(err => {
        alert(err.response?.data || "无权删除")
      })
    }
  }

  const handleDeleteComment = (id) => {
    if (window.confirm("确定要删除这条评论吗？")) {
      request.delete(`/comments/${id}`).then(() => {
        setComments(comments.filter(c => c.id !== id))
      }).catch(err => console.error(err))
    }
  }

  const displayPosts = isAdmin ? posts : posts.filter(p => p.author === currentUsername)

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div className="header">
        <h1>⚙️ 后台管理中心</h1>
        <Link to="/" className="btn btn-back">← 返回前台</Link>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('posts')}>
          📝 文章管理 ({displayPosts.length})
        </button>
        <button className={`btn ${activeTab === 'comments' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('comments')}>
          💬 评论管理 ({comments.length})
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {activeTab === 'posts' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th style={{ padding: '15px' }}>ID</th>
                <th style={{ padding: '15px' }}>标题</th>
                <th style={{ padding: '15px' }}>作者</th>
                <th style={{ padding: '15px' }}>分类</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {displayPosts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '15px', color: '#94a3b8' }}>{post.id}</td>
                  <td style={{ padding: '15px', color: '#fff', fontWeight: 'bold' }}>
                    {post.title}
                    {/* 新增草稿标签 */}
                    {post.isDraft && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>草稿</span>}
                  </td>
                  <td style={{ padding: '15px', color: '#64ffda' }}>{post.author}</td>
                  <td style={{ padding: '15px', color: '#ff6b9e' }}>{post.category || '未分类'}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <Link to={`/edit/${post.id}`} className="btn btn-warning" style={{ padding: '4px 10px', marginRight: '8px' }}>编辑</Link>
                    <button onClick={() => handleDeletePost(post.id)} className="btn btn-danger" style={{ padding: '4px 10px' }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th style={{ padding: '15px' }}>ID</th>
                <th style={{ padding: '15px' }}>评论者</th>
                <th style={{ padding: '15px' }}>内容</th>
                <th style={{ padding: '15px' }}>时间</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '15px', color: '#94a3b8' }}>{comment.id}</td>
                  <td style={{ padding: '15px', color: '#60a5fa' }}>👤 {comment.author}</td>
                  <td style={{ padding: '15px', color: '#e2e8f0', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comment.content}</td>
                  <td style={{ padding: '15px', color: '#94a3b8', fontSize: '13px' }}>{new Date(comment.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteComment(comment.id)} className="btn btn-danger" style={{ padding: '4px 10px' }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}