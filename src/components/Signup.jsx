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
  const [isLoading, setIsLoading] = useState(false) // Added a loading state for better UX

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
    setIsLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const usersRef = ref(db, 'users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(formData.email));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        setError('Email already exists');
        setIsLoading(false);
        return;
      }

      const newUserKey = Date.now(); 
      await set(ref(db, 'users/' + newUserKey), {
        id: newUserKey,
        username: formData.username,
        email: formData.email,
        password: formData.password 
      });

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1500);

    } catch (err) {
      console.error(err);
      setError('Database error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
      style={{
        backgroundImage: 'url(/PalRecBG.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Semi-transparent overlay for text readability in all themes */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm transition-colors duration-300"></div>

      <div className="relative z-10 w-full max-w-[420px] text-center">
        
        <h1 className="font-serif text-[42px] font-bold text-foreground m-0 mb-1.5 tracking-tight transition-colors duration-300">
          Palestine Recorded
        </h1>

        <p className="font-serif italic text-[15px] text-muted-foreground mb-6 transition-colors duration-300">
          Join a community dedicated to truth and heritage
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border transition-colors duration-300">
          <form onSubmit={handleSignup}>
            
            {/* Username */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Confirm Password */}
            <div className="text-left mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-[#2a9d4a]/10 text-[#2a9d4a] border border-[#2a9d4a]/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {success}
              </div>
            )}

            {/* Signup Button */}
            <button 
              type="submit" 
              disabled={isLoading || success !== ''}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-foreground transition-colors duration-300 m-0">
            Already have an account?{' '}
            <a
              onClick={() => (!isLoading && success === '') && navigate({ to: '/' })}
              className={`font-bold text-primary decoration-2 underline-offset-2 ${(isLoading || success !== '') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}