import { useState } from 'react';
import { MapPin, Eye, EyeOff, AlertTriangle, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('login');
        setConfirmPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before signing in. Check your inbox.');
          }
          throw signInError;
        }
        // AuthContext will pick up the session change automatically
        onLogin();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Main content */}
      <main className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 map-grid opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-red-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-red-500/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-900 animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Code<span className="text-red-500">Red</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Emergency Locator</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight gradient-text mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Sign in to access PulsePoint' : 'Join the PulsePoint network'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/8 p-8 shadow-2xl card-glow">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password (login only) */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Success (signup only) */}
              {success && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="w-4 h-4 text-green-400 shrink-0">✓</span>
                  <p className="text-xs text-green-400">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25 emergency-pulse"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Toggle login / signup */}
            <p className="text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={toggleMode} className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={toggleMode} className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-700 mt-6">
            Protected by PulsePoint Emergency Network
          </p>
        </div>
      </main>
    </div>
  );
}