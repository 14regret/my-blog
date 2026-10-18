import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import request from './axiosConfig'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    request.post('/auth/login', { username, password })
      .then(res => {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('username', res.data.username)
          alert('登录成功！')
          navigate('/')
        } else {
          alert(res.data.message)
        }
      })
      .catch(err => {
        console.error(err)
        alert('请求失败，请检查后端')
      })
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 用户登录</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>用户名：</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>密码：</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '15px' }}>
          登录
        </button>
        <div style={{ textAlign: 'center' }}>
          还没有账号？ <Link to="/register" style={{ color: '#3b82f6' }}>去注册</Link>
        </div>
      </form>
    </div>
  )
}