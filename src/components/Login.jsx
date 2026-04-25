import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {   // 🔴 ONLY CHANGE
    e.preventDefault()

    try {
      // 🔴 ONLY CHANGE (real DB check)
      const res = await fetch(`http://localhost:3001/users?username=${username}&password=${password}`)
      const data = await res.json()

      if (data.length > 0) {
        setError('')
        navigate({ to: '/timeline' })
      } else {
        setError('Invalid username or password')
      }

    } catch (err) {
      setError('Server error. Make sure json-server is running.')
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem 1rem',
      backgroundImage: 'url(/PalRecBG.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: '42px',
          fontWeight: 700,
          color: '#111',
          margin: '0 0 6px',
          letterSpacing: '-0.5px',
        }}>Palestine Recorded</h1>

        <p style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: '15px',
          color: '#333',
          margin: '0 0 24px',
        }}>Join a community dedicated to truth and heritage</p>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '28px 28px 24px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        }}>
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#fdecea',
                color: '#c0392b',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '14px',
                textAlign: 'left',
              }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button type="submit" style={{
              width: '100%',
              padding: '13px',
              background: '#2a9d4a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '18px',
            }}>
              Login
            </button>
          </form>

          {/* OR Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
          </div>

          {/* Institute / Government Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button style={{
              flex: 1,
              padding: '12px 8px',
              background: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Institute Login
            </button>
            <button style={{
              flex: 1,
              padding: '12px 8px',
              background: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Government Login
            </button>
          </div>

          {/* Sign Up */}
          <p style={{ fontSize: '14px', color: '#c0392b', margin: 0 }}>
            Don't have an account?{' '}
            <a
              onClick={() => navigate({ to: '/signup' })}
              style={{ color: '#c0392b', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}