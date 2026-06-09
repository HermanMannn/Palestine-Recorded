import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'

export default function Login() {
  const { t } = useTranslation();
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
      navigate({ to: '/' })
    } catch (err) {
      setError(err.message || t('auth.loginFailed'))
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
      setApplyError(t('auth.allFieldsRequired'))
      return
    }
    if (password !== confirmPassword) {
      setApplyError(t('auth.passwordMismatch'))
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
      setApplyError(err.message || t('auth.submissionFailed'))
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

      <div className="relative z-10 w-full max-w-[420px] text-center">
        <h1 className="font-serif text-[42px] font-bold text-foreground m-0 mb-1.5 tracking-tight">
          {t('navbar.title')}
        </h1>
        <p className="font-serif italic text-[15px] text-muted-foreground mb-6">
          {t('auth.joinCommunity')}
        </p>

        <div className="bg-card/95 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-border">
          {submittedReview ? (
            <div className="animate-in fade-in zoom-in duration-500 py-4">
              <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('auth.applicationSubmittedTitle')}</h2>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {t('auth.applicationSubmitted')} {' '}
                <span className="font-semibold text-foreground">{applyForm.email}</span>.<br /><br />
                {t('auth.applicationReview')}
              </p>
              <button
                onClick={() => navigate({ to: '/timeline' })}
                className="text-sm font-bold text-primary hover:underline"
              >
                {t('404.goHome')}
              </button>
            </div>
          ) : applyType ? (
            <form onSubmit={handleApplySubmit} className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {applyType === 'government' ? t('auth.governmentApplication') : t('auth.researcherApplication')}
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                {t('auth.applicationReviewed')}
              </p>

              {[
                { name: 'username', label: t('auth.username'), type: 'text' },
                { name: 'email', label: t('auth.email'), type: 'email' },
                { name: 'password', label: t('auth.password'), type: 'password' },
                { name: 'confirmPassword', label: t('auth.confirmPassword'), type: 'password' },
                {
                  name: 'organizationName',
                  label: applyType === 'government' ? t('auth.governmentName') : t('auth.researchInstitution'),
                  type: 'text',
                },
                {
                  name: 'officialId',
                  label: applyType === 'government' ? t('auth.governmentId') : t('auth.institutionId'),
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
                {applyLoading ? t('auth.submitting') : t('auth.submitApplication')}
              </button>
              <button
                type="button"
                onClick={() => setApplyType(null)}
                disabled={applyLoading}
                className="text-sm font-bold text-muted-foreground hover:underline"
              >
                {t('auth.cancel')}
              </button>
            </form>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-2">{t('auth.browseAsGuest')}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('auth.exploreContent')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/timeline' })}
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 mb-4"
                >
                  {t('auth.continueAsGuest')}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{t('common.or')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleLogin} className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{t('auth.signIn')}</h2>
                <div className="text-left mb-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                  />
                </div>

                <div className="text-left mb-5">
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('auth.password')}</label>
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
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                </button>
              </form>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{t('auth.applyAsVerified')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => openApply('researcher')}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {t('auth.institute')}
                </button>
                <button
                  type="button"
                  onClick={() => openApply('government')}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {t('auth.government')}
                </button>
              </div>

              <p className="text-sm text-foreground m-0">
                {t('auth.dontHaveAccount')}{' '}
                <a
                  onClick={() => !isLoading && navigate({ to: '/signup' })}
                  className={`font-bold text-destructive decoration-2 underline-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:underline'}`}
                >
                  {t('auth.signUp')}
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
