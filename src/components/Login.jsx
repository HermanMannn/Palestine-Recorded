import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { auth, db } from '../firebase'; // Consolidated imports
import { ref, query, orderByChild, equalTo, get } from "firebase/database";

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Added loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Start loading

    try {
      const usersRef = ref(db, 'users');
      const userQuery = query(usersRef, orderByChild('username'), equalTo(username));
      const snapshot = await get(userQuery);

      if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];

        if (userData.password === password) {
          navigate({ to: '/timeline' });
        } else {
          setError('Invalid password');
          setIsLoading(false); // Stop loading on error
        }
      } else {
        setError('User not found');
        setIsLoading(false); // Stop loading on error
      }
    } catch (err) {
      console.error("FULL ERROR:", err);
      setError(`Error: ${err.message}`);
      setIsLoading(false); // Stop loading on catch
    }
  };

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
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
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
                disabled={isLoading}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
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
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                background: isLoading ? '#94c9a1' : '#2a9d4a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '18px',
                transition: 'background 0.2s',
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button disabled={isLoading} style={{
              flex: 1,
              padding: '12px 8px',
              background: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}>
              Institute Login
            </button>
            <button disabled={isLoading} style={{
              flex: 1,
              padding: '12px 8px',
              background: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}>
              Government Login
            </button>
          </div>

          <p style={{ fontSize: '14px', color: '#c0392b', margin: 0 }}>
            Don't have an account?{' '}
            <a
              onClick={() => !isLoading && navigate({ to: '/signup' })}
              style={{ 
                color: '#c0392b', 
                fontWeight: 700, 
                textDecoration: 'none', 
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}