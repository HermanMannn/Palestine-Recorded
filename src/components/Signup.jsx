import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  // New state to track if we are waiting for email verification
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Listen for authentication state changes (detects when they click the email link)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // If the event is SIGNED_IN, it means they clicked the link and are verified!
      if (event === 'SIGNED_IN' && session) {
        navigate({ to: '/timeline' })
      }
    })

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('auth.allFieldsRequired'))
      setIsLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      setIsLoading(false)
      return
    }

    try {
      // Check if email already exists in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle()

      if (existingProfile) {
        setError(t('auth.emailAlreadyRegistered'))
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/timeline`,
          data: { username: formData.username,
            display_name: formData.username,
           },
        },
      })

      if (error) throw error

      // Instead of redirecting, we switch the UI to the "Verify Email" screen
      setIsAwaitingVerification(true)
      
    } catch (err) {
      console.error(err)
      setError(err.message || t('auth.signupFailed'))
    } finally {
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
          {t('navbar.title')}
        </h1>
        <p className="font-serif italic text-[15px] text-muted-foreground mb-6">
          {t('auth.joinCommunity')}
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border min-h-[400px] flex flex-col justify-center">
          
          {/* Conditional Rendering: Show Verification Screen OR the Form */}
          {isAwaitingVerification ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('auth.checkInbox')}</h2>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {t('auth.verificationSent')} <span className="font-semibold text-foreground">{formData.email}</span>. <br/><br/>
                {t('auth.clickLink')}
              </p>
              <button 
                onClick={() => setIsAwaitingVerification(false)}
                className="text-sm font-bold text-primary hover:underline"
              >
                {t('auth.useDifferentEmail')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="animate-in fade-in duration-300">
              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.username')}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
              </div>

              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
              </div>

              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password')}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
              </div>

              <div className="text-left mb-5">
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </button>

              <p className="text-sm text-foreground m-0">
                {t('auth.alreadyHaveAccount')}{' '}
                <a
                  onClick={() => !isLoading && navigate({ to: '/' })}
                  className={`font-bold text-primary decoration-2 underline-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
                >
                  {t('auth.login')}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
