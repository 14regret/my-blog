import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ flex: 1, minWidth: '200px', textAlign: 'center', padding: '25px' }}>
    <div style={{ fontSize: '30px', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '5px' }}>{title}</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>{value}</div>
  </div>
)

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [stats, setStats] = useState(null)
  const [links, setLinks] = useState([])
  
  // 配置状态
  const [config, setConfig] = useState({ announcement: '', siteName: '', siteSubtitle: '', siteFooter: '', siteRecord: '' })
  const [newLink, setNewLink] = useState({ name: '', url: '', avatar: '', description: '' })

  const navigate = useNavigate()
  const currentUsername = localStorage.getItem('username')
  const isAdmin = currentUsername === 'admin'

  useEffect(() => {
    document.title = '后台管理中心'
    if (!currentUsername) { alert("请先登录！"); navigate('/login'); return }
    
    request.get('/posts?page=0&size=100&admin=true').then(res => setPosts(res.data.content)).catch(err => console.error(err))
    request.get('/comments').then(res => setComments(res.data)).catch(err => console.error(err))
    request.get('/stats').then(res => setStats(res.data)).catch(err => console.error(err))
    request.get('/friend-links').then(res => setLinks(res.data)).catch(err => console.error(err))
    request.get('/config').then(res => setConfig(res.data)).catch(err => console.error(err))
  }, [navigate, currentUsername])

  // === 操作逻辑 ===
  const saveConfig = () => {
    request.post('/config', config).then(() => {
      alert("配置已更新！刷新前台即可看到变化。")
    }).catch(err => { console.error(err); alert("修改失败，仅限管理员") })
  }

  const handleDeletePost = (id) => {
    if (window.confirm("确定要删除这篇文章吗？")) {
      request.delete(`/posts/${id}`).then(() => setPosts(posts.filter(p => p.id !== id))).catch(err => alert(err.response?.data || "无权删除"))
    }
  }

  const handleDeleteComment = (id) => {
    if (window.confirm("确定要删除这条评论吗？")) {
      request.delete(`/comments/${id}`).then(() => setComments(comments.filter(c => c.id !== id))).catch(err => console.error(err))
    }
  }

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return alert("名称和链接不能为空")
    request.post('/friend-links', newLink).then(res => {
      setLinks([...links, res.data]); setNewLink({ name: '', url: '', avatar: '', description: '' }); alert("添加成功")
    }).catch(err => { console.error(err); alert("添加失败") })
  }

  const handleDeleteLink = (id) => {
    if (window.confirm("确定删除此友链吗？")) {
      request.delete(`/friend-links/${id}`).then(() => setLinks(links.filter(l => l.id !== id))).catch(err => { console.error(err); alert("删除失败") })
    }
  }

  const displayPosts = isAdmin ? posts : posts.filter(p => p.author === currentUsername)

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div className="header">
        <h1>⚙️ 后台管理中心</h1>
        <Link to="/" className="btn btn-back">← 返回前台</Link>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('dashboard')}>📊 数据总览</button>
        <button className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('posts')}>📝 文章管理 ({displayPosts.length})</button>
        <button className={`btn ${activeTab === 'comments' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('comments')}>💬 评论管理 ({comments.length})</button>
        <button className={`btn ${activeTab === 'links' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('links')}>🔗 友链管理</button>
        <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-back'}`} onClick={() => setActiveTab('settings')}>⚙️ 站点设置</button>
      </div>

      {/* 1. 数据总览 */}
      {activeTab === 'dashboard' && stats && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <StatCard title="总文章数" value={stats.totalPosts} icon="📚" color="#64ffda" />
          <StatCard title="总浏览量" value={stats.totalViews} icon="👁️" color="#60a5fa" />
          <StatCard title="总点赞数" value={stats.totalLikes} icon="❤️" color="#ff6b9e" />
          <StatCard title="总评论数" value={stats.totalComments} icon="💬" color="#fcd34d" />
        </div>
      )}

      {/* 2. 站点设置 */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <h3 style={{ color: '#64ffda', marginTop: 0 }}>⚙️ 站点全局配置</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>站点名称 (Logo文字)</label>
              <input type="text" value={config.siteName || ''} onChange={e => setConfig({...config, siteName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>站点副标题</label>
              <input type="text" value={config.siteSubtitle || ''} onChange={e => setConfig({...config, siteSubtitle: e.target.value})} />
            </div>
            <div className="form-group">
              <label>全站公告 (留空则不显示)</label>
              <input type="text" value={config.announcement || ''} onChange={e => setConfig({...config, announcement: e.target.value})} />
            </div>
            <div className="form-group">
              <label>页脚版权/备案号</label>
              <input type="text" value={config.siteFooter || ''} onChange={e => setConfig({...config, siteFooter: e.target.value})} />
            </div>
          </div>
          <button onClick={saveConfig} className="btn btn-primary" style={{ marginTop: '10px' }}>保存配置</button>
        </div>
      )}

      {/* 3. 文章管理 */}
      {activeTab === 'posts' && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
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
                    {post.isDraft && !post.scheduledTime && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>草稿</span>}
                    {post.isDraft && post.scheduledTime && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>⏰ 定时中</span>}
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
        </div>
      )}

      {/* 4. 评论管理 */}
      {activeTab === 'comments' && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
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
        </div>
      )}

      {/* 5. 友链管理 */}
      {activeTab === 'links' && (
        <div>
          <div className="glass-card" style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)' }}>
            <h3 style={{ color: '#64ffda', marginTop: 0 }}>➕ 添加新友链</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" placeholder="网站名称 (必填)" value={newLink.name} onChange={e => setNewLink({...newLink, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input type="text" placeholder="网站链接 (必填, http开头)" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input type="text" placeholder="头像链接 (选填)" value={newLink.avatar} onChange={e => setNewLink({...newLink, avatar: e.target.value})} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input type="text" placeholder="一句话简介 (选填)" value={newLink.description} onChange={e => setNewLink({...newLink, description: e.target.value})} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
            <button onClick={handleAddLink} className="btn btn-primary" style={{ marginTop: '15px', width: '100%' }}>保存友链</button>
          </div>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <tr>
                  <th style={{ padding: '15px' }}>名称</th>
                  <th style={{ padding: '15px' }}>链接</th>
                  <th style={{ padding: '15px' }}>状态</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '15px', color: '#fff' }}>{link.name}</td>
                    <td style={{ padding: '15px', color: '#60a5fa' }}><a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>{link.url}</a></td>
                    <td style={{ padding: '15px' }}>{link.isOnline ? '🟢 在线' : '🔴 离线'}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteLink(link.id)} className="btn btn-danger" style={{ padding: '4px 10px' }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}