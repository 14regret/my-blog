import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request from './axiosConfig'

export default function Profile() {
  const [profile, setProfile] = useState({ avatar: '', bio: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  // 【修复】使用 useCallback 包裹，并移到 useEffect 上方
  const fetchProfile = useCallback(() => {
    if (!username) return
    request.get(`/users/${username}/profile`)
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
  }, [username])

  useEffect(() => {
    document.title = '个人中心 - Mxj 的博客'
    if (!username) {
      alert("请先登录！")
      navigate('/login')
      return
    }
    fetchProfile()
  }, [navigate, username, fetchProfile]) // 将 fetchProfile 加入依赖数组

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    request.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
      setUploading(false)
      if (res.data.url) setProfile({ ...profile, avatar: res.data.url })
    }).catch(err => { 
      setUploading(false); 
      console.error(err);
      alert("上传失败") 
    })
  }

  const handleSave = () => {
    request.post('/users/profile', { avatar: profile.avatar, bio: profile.bio })
      .then(() => { 
        setIsEditing(false); 
        alert("资料已更新！"); 
        window.location.reload() 
      })
      .catch(err => { 
        console.error(err); 
        alert("保存失败") 
      })
  }

  if (!username) return null

  return (
    <div className="container">
      <div className="header">
        <h1>👤 个人中心</h1>
        <Link to="/" className="btn btn-back">← 返回首页</Link>
      </div>

      <div className="glass-card" style={{ background: 'rgba(100, 255, 218, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', position: 'relative' }}>
        
        {/* 头像展示/上传 */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #64ffda', boxShadow: '0 0 20px rgba(100,255,218,0.4)' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(45deg, #ff6b9e, #64ffda)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px', color: '#fff', fontWeight: 'bold' }}>
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          {isEditing && (
            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <input type="file" accept="image/*" id="avatar-upload" style={{ display: 'none' }} onChange={handleImageUpload} />
              <label htmlFor="avatar-upload" className="btn btn-primary" style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '50%' }}>
                {uploading ? '...' : '📷'}
              </label>
            </div>
          )}
        </div>

        <h2 style={{ color: '#fff', margin: '0 0 10px 0' }}>{username}</h2>
        
        {/* 简介展示/编辑 */}
        {isEditing ? (
          <textarea 
            value={profile.bio || ''} 
            onChange={e => setProfile({ ...profile, bio: e.target.value })} 
            placeholder="介绍一下你自己吧..." 
            style={{ width: '80%', maxWidth: '400px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px', marginBottom: '20px', outline: 'none' }} 
          />
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '500px' }}>{profile.bio || '这个人很懒，什么都没留下~'}</p>
        )}

        {isEditing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} className="btn btn-primary">保存资料</button>
            <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="btn btn-back">取消</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-back">✏️ 编辑资料</button>
        )}
      </div>
    </div>
  )
}