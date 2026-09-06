import React, { useState } from 'react';
import { 
  Bot, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Zap,
  Globe
} from 'lucide-react';
import { 
  signInWithGoogle, 
  registerWithEmail, 
  loginWithEmail 
} from '../services/firebase';
import { Footer } from './Footer';
import { InfoModalType } from './InfoModal';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onOpenInfo: (type: InfoModalType) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onOpenInfo }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Please accept the Terms of Service and Privacy Policy to register.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(cleanEmail, password, fullName.trim() || 'Aman Kumar Yadav');
      } else {
        await loginWithEmail(cleanEmail, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Authentication error:', err);
      let message = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please switch to Sign In.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. If you are new, please Register first.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please verify your password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google Sign-in failed. Please try again or use email sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // Automatic quick start with registered test account
      try {
        await loginWithEmail('candidate.demo@edgedash.ai', 'EdgeDashDemo2026!');
      } catch (loginErr: any) {
        // If not created yet, register it
        await registerWithEmail('candidate.demo@edgedash.ai', 'EdgeDashDemo2026!', 'Aman Kumar Yadav');
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Demo sign-in error:', err);
      setErrorMsg('Demo sign-in initialized. Please try standard email or Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">EdgeDash</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                v2.4 Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenInfo('faqs')}
              className="text-xs text-slate-400 hover:text-slate-200 transition hidden sm:inline"
            >
              FAQs
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
            <button
              id="btn-switch-auth-mode-header"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg(null);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full max-w-5xl">
          
          {/* Left Column: Platform Intelligence Value Proposition */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Autonomous Career Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Real Jobs. Zero Hallucination. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                100% Tailored ATS Resumes.
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Register or sign in to activate your dedicated career cockpit. Connects with live job portal APIs, 
              benchmarks your skills against actual vacancies, and creates customized application packets.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Real Public Job Portal APIs</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Live active postings from Jobicy, Remotive, and Arbeitnow.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Zero-Hallucination Integrity</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Never invents fake companies or unearned skills. 100% verified profile alignment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Cloud Persistence via Firebase</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure Firestore database saves your profile and application history across all devices.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/20">
              
              {/* Header Tabs: Register vs Login */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {mode === 'register' 
                      ? 'Register first to start using EdgeDash application' 
                      : 'Sign in to access your jobs & tailored resumes'}
                  </p>
                </div>
              </div>

              {/* Mode Toggle Pills */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
                <button
                  type="button"
                  id="tab-btn-register"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register (New User)
                </button>

                <button
                  type="button"
                  id="tab-btn-login"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In (Existing)
                </button>
              </div>

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1-Click Google Sign-In */}
              <button
                type="button"
                id="btn-google-auth"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition shadow-sm mb-5 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-medium absolute">
                  Or with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        id="input-auth-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aman Kumar Yadav"
                        required={mode === 'register'}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aman895980@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters</p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        id="input-auth-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required={mode === 'register'}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Terms of Service & Privacy Policy acceptance checkbox */}
                {mode === 'register' && (
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="checkbox-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="checkbox-terms" className="text-[11px] text-slate-400 leading-tight">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => onOpenInfo('terms')}
                        className="text-blue-400 hover:underline inline"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => onOpenInfo('privacy')}
                        className="text-blue-400 hover:underline inline"
                      >
                        Privacy Policy
                      </button>.
                    </label>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 mt-2"
                >
                  <span>
                    {loading 
                      ? 'Authenticating with Firebase...' 
                      : (mode === 'register' ? 'Register & Enter Platform' : 'Sign In to EdgeDash')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Account Quick Access Button */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  id="btn-quick-demo"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="text-xs text-slate-400 hover:text-blue-400 transition underline underline-offset-4"
                >
                  ⚡ Or Click Here for Quick Demo Access (Aman Kumar Yadav Profile)
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer with FAQs, Terms, and Privacy */}
      <Footer onOpenInfo={onOpenInfo} isAuthenticated={false} />
    </div>
  );
};
