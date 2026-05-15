import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

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
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      setIsLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/timeline`,
          data: { username: formData.username },
        },
      })
      if (error) throw error

      setSuccess('Account created! Redirecting...')
      setTimeout(() => navigate({ to: '/' }), 1500)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Signup failed')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: 'url(/PalRecBG.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-[420px] text-center">
        <h1 className="font-serif text-[42px] font-bold text-foreground m-0 mb-1.5 tracking-tight">
          Palestine Recorded
        </h1>
        <p className="font-serif italic text-[15px] text-muted-foreground mb-6">
          Join a community dedicated to truth and heritage
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border">
          <form onSubmit={handleSignup}>
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div className="text-left mb-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading || success !== ''}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-[#2a9d4a]/10 text-[#2a9d4a] border border-[#2a9d4a]/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || success !== ''}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-foreground m-0">
            Already have an account?{' '}
            <a
              onClick={() => !isLoading && success === '' && navigate({ to: '/' })}
              className={`font-bold text-primary decoration-2 underline-offset-2 ${isLoading || success !== '' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
