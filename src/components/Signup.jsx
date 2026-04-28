import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
 import { db } from '../firebase'; 
import { ref, get, set, query, orderByChild, equalTo } from "firebase/database";


export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }



const handleSignup = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  // 1. Keep your existing frontend validations
  if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
    setError('All fields are required');
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    // 2. Check if Email already exists (Replacement for your 'check' fetch)
    const usersRef = ref(db, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(formData.email));
    const snapshot = await get(emailQuery);

    if (snapshot.exists()) {
      setError('Email already exists');
      return;
    }

    // 3. Create the new user (Replacement for your POST fetch)
    // We create a unique key using Date.now() to mimic how json-server adds IDs
    const newUserKey = Date.now(); 
    await set(ref(db, 'users/' + newUserKey), {
      id: newUserKey,
      username: formData.username,
      email: formData.email,
      password: formData.password // Note: Still plain text for now as requested
    });

    setSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
      navigate({ to: '/' });
    }, 1500);

  } catch (err) {
    console.error(err);
    setError('Database error. Please try again.');
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
          <form onSubmit={handleSignup}>
            {/* Username */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
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

            {/* Email */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

            {/* Confirm Password */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#222', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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

            {success && (
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '14px',
                textAlign: 'left',
              }}>
                {success}
              </div>
            )}

            {/* Signup Button */}
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
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <p style={{
            fontSize: '13px',
            color: '#666',
            margin: 0,
          }}>
            Already have an account?{' '}
            <a
              onClick={() => navigate({ to: '/' })}
              style={{
                color: '#2a9d4a',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}