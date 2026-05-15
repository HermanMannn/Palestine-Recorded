import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // keep a lightweight cache for legacy components
      localStorage.setItem('palrec_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
      }))
      navigate({ to: '/timeline' })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="absolute inset-0 transition-colors duration-300 dark:bg-slate-900/40 text-foreground pb-20 overflow-x-hidden custom-scrollbar"></div>

      <div className="relative z-10 w-full max-w-[420px] text-center">
        <h1 className="font-serif text-[42px] font-bold text-foreground m-0 mb-1.5 tracking-tight">
          Palestine Recorded
        </h1>
        <p className="font-serif italic text-[15px] text-muted-foreground mb-6">
          Join a community dedicated to truth and heritage
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border">
          <form onSubmit={handleLogin}>
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div className="text-left mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex gap-3 mb-6">
            <button disabled={isLoading} className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              Institute Login
            </button>
            <button disabled={isLoading} className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
              Government Login
            </button>
          </div>

          <p className="text-sm text-foreground m-0">
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
