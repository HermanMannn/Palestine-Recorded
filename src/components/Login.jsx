import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 'government' | 'researcher' | null
  const [applyType, setApplyType] = useState(null)
  const [applyForm, setApplyForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    officialId: '',
  })
  const [applyError, setApplyError] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [submittedReview, setSubmittedReview] = useState(false)

  // After verification email click, user is SIGNED_IN — bounce them to timeline.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && submittedReview) {
        navigate({ to: '/timeline' })
      }
    })
    return () => authListener.subscription.unsubscribe()
  }, [navigate, submittedReview])

  // Auto-redirect after showing the "submitted for review" screen
  useEffect(() => {
    if (!submittedReview) return
    const t = setTimeout(() => navigate({ to: '/timeline' }), 5000)
    return () => clearTimeout(t)
  }, [submittedReview, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      localStorage.setItem('palrec_user', JSON.stringify({ id: data.user.id, email: data.user.email }))
      navigate({ to: '/timeline' })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const openApply = (type) => {
    setApplyType(type)
    setApplyError('')
    setApplyForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      officialId: '',
    })
  }

  const handleApplyChange = (e) => {
    const { name, value } = e.target
    setApplyForm((p) => ({ ...p, [name]: value }))
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    setApplyError('')

    const { username, email, password, confirmPassword, organizationName, officialId } = applyForm
    if (!username || !email || !password || !confirmPassword || !organizationName || !officialId) {
      setApplyError('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setApplyError('Passwords do not match')
      return
    }

    setApplyLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/timeline`,
          data: {
            username,
            display_name: username,
            requested_role: applyType,
            organization_name: organizationName,
            official_id: officialId,
          },
        },
      })
      if (signUpError) throw signUpError

      const userId = data.user?.id
      if (userId) {
        // Best-effort insert — if not yet authed (email confirmation flow),
        // RLS may reject. Try anyway; failure is non-fatal for UX.
        await supabase.from('verification_requests').insert({
          user_id: userId,
          account_type: applyType,
          organization_name: organizationName,
          official_id: officialId,
          email,
        })
      }

      setSubmittedReview(true)
      setApplyType(null)
    } catch (err) {
      setApplyError(err.message || 'Submission failed')
    } finally {
      setApplyLoading(false)
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

      <div className="relative z-10 w-full max-w-[440px] text-center">
        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-card/70 backdrop-blur-md border border-border/60 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          A Living Archive
        </div>
        <h1 className="font-serif text-[52px] leading-[1.05] text-foreground m-0 mb-3 tracking-tight">
          Palestine <span className="italic text-primary">Recorded</span>
        </h1>
        <p className="font-serif italic text-[16px] text-muted-foreground mb-7 max-w-sm mx-auto">
          A community dedicated to truth, memory, and heritage.
        </p>


        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border">
          {submittedReview ? (
            <div className="animate-in fade-in zoom-in duration-500 py-4">
              <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Application submitted</h2>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                We've sent a verification email to{' '}
                <span className="font-semibold text-foreground">{applyForm.email}</span>.<br /><br />
                Your application will be reviewed by a moderator. You'll be redirected to the timeline in a moment.
              </p>
              <button
                onClick={() => navigate({ to: '/timeline' })}
                className="text-sm font-bold text-primary hover:underline"
              >
                Go to timeline now
              </button>
            </div>
          ) : applyType ? (
            <form onSubmit={handleApplySubmit} className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {applyType === 'government' ? 'Government Application' : 'Researcher Application'}
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                Your application will be reviewed by a moderator.
              </p>

              {[
                { name: 'username', label: 'Username', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'password', label: 'Password', type: 'password' },
                { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
                {
                  name: 'organizationName',
                  label: applyType === 'government' ? 'Government Name' : 'Research Institution',
                  type: 'text',
                },
                {
                  name: 'officialId',
                  label: applyType === 'government' ? 'Government ID' : 'Institution ID',
                  type: 'text',
                },
              ].map((f) => (
                <div key={f.name} className="text-left mb-3">
                  <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={applyForm[f.name]}
                    onChange={handleApplyChange}
                    disabled={applyLoading}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                  />
                </div>
              ))}

              {applyError && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-sm mb-4 text-left font-medium">
                  {applyError}
                </div>
              )}

              <button
                type="submit"
                disabled={applyLoading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => setApplyType(null)}
                disabled={applyLoading}
                className="text-sm font-bold text-muted-foreground hover:underline"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
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
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">OR APPLY AS</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => openApply('researcher')}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  Institute
                </button>
                <button
                  type="button"
                  onClick={() => openApply('government')}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  Government
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
