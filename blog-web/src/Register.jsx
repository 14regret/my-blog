import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import request from './axiosConfig'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return alert("两次输入的密码不一致！")
    }

    request.post('/auth/register', { username, password })
      .then(res => {
        alert(res.data.message)
        if (res.data.message === "注册成功") {
          navigate('/login') // 注册成功跳去登录
        }
      })
      .catch(err => {
        console.error(err)
        alert('注册请求失败，请检查后端')
      })
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 注册新账号</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>用户名：</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="输入用户名" />
        </div>
        <div className="form-group">
          <label>密码：</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入密码" />
        </div>
        <div className="form-group">
          <label>确认密码：</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="再次输入密码" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '15px' }}>
          注册
        </button>
        <div style={{ textAlign: 'center' }}>
          已有账号？ <Link to="/login" style={{ color: '#3b82f6' }}>去登录</Link>
        </div>
      </form>
    </div>
  )
}