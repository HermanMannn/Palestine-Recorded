import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { db } from '../firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const usersRef = ref(db, 'users');
      const userQuery = query(usersRef, orderByChild('username'), equalTo(username));
      const snapshot = await get(userQuery);

      if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];

        if (userData.password === password) {
          localStorage.setItem('palrec_user', JSON.stringify({ 
            username: userData.username 
          }));
          navigate({ to: '/timeline' });
        } else {
          setError('Invalid password');
          setIsLoading(false);
        }
      } else {
        setError('User not found');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("FULL ERROR:", err);
      setError(`Error: ${err.message}`);
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
      {/* Semi-transparent overlay to ensure text is readable in all themes */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm transition-colors duration-300"></div>

      <div className="relative z-10 w-full max-w-[420px] text-center">
        
        <h1 className="font-serif text-[42px] font-bold text-foreground m-0 mb-1.5 tracking-tight transition-colors duration-300">
          Palestine Recorded
        </h1>

        <p className="font-serif italic text-[15px] text-muted-foreground mb-6 transition-colors duration-300">
          Join a community dedicated to truth and heritage
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border transition-colors duration-300">
          <form onSubmit={handleLogin}>
            
            {/* Username / Email */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="text-left mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5 transition-colors duration-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 disabled:opacity-60"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border transition-colors duration-300" />
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase transition-colors duration-300">OR</span>
            <div className="flex-1 h-px bg-border transition-colors duration-300" />
          </div>

          {/* Secondary Logins */}
          <div className="flex gap-3 mb-6">
            <button 
              disabled={isLoading} 
              className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Institute Login
            </button>
            <button 
              disabled={isLoading} 
              className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Government Login
            </button>
          </div>

          {/* Signup Link */}
          <p className="text-sm text-foreground transition-colors duration-300 m-0">
            Don't have an account?{' '}
            <a
              onClick={() => !isLoading && navigate({ to: '/signup' })}
              className={`font-bold text-destructive decoration-2 underline-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}