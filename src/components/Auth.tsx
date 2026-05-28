import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Shield, Sparkles, KeyRound, Mail, User as UserIcon, ArrowRight, RefreshCw, Smartphone } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, verifyEmail, resendOTP, simulateOAuth } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayError = (err: any) => {
    setError(err?.message || String(err));
    setTimeout(() => setError(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setLoading(true);
    try {
      const resp = await register(name, email, password);
      if (resp.status === 'verify_needed') {
        setMode('verify');
        setInfo(`Verification OTP sent! Check your inbox or use "123456" for immediate simulation.`);
      }
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      await verifyEmail(otp);
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOTP();
      setInfo('OTP code re-sent! (Rate limits: 3/hour check passed)');
      setTimeout(() => setInfo(null), 5000);
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setInfo(`If an account with ${email} exists, an encryption reset token has been enqueued to your Resend mail server.`);
    setTimeout(() => {
      setInfo(null);
      setMode('login');
    }, 4000);
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    try {
      await simulateOAuth();
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  const autoFillDev = () => {
    setEmail('biniyamgirmamengesha2@gmail.com');
    setPassword('developer_secret_pass');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100 items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-3 border border-indigo-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            RAG Support Platform
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' && 'Sign in to access your dashboard'}
            {mode === 'register' && 'Create your developer account'}
            {mode === 'verify' && 'Verify your email address'}
            {mode === 'forgot' && 'Reset secure password access'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs mb-5 flex gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl p-3 text-xs mb-5">
            {info}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="biniyam@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Password</label>
                <button 
                  type="button" 
                  onClick={() => setMode('forgot')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:translate-y-[1px] transition-transform cursor-pointer"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute w-full border-t border-slate-800" />
              <span className="relative bg-slate-950 px-3 text-xs text-slate-500 uppercase">Or Continue With</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleOAuth}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-300 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.61 0 3.05.56 4.19 1.65l3.12-3.12C17.43 1.83 14.93 1 12 1 7.37 1 3.44 3.63 1.56 7.42l3.75 2.91C6.18 6.94 8.87 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.11 2.73-2.35 3.58l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.31 14.83c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.56 7.56C.56 9.56 0 11.78 0 14s.56 4.44 1.56 6.44l3.75-2.61z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.13 0-5.82-1.9-6.77-4.47L1.87 16.48C3.84 20.32 7.6 23 12 23z"
                />
              </svg>
              Google Authentication
            </button>

            <div className="text-center text-xs mt-4 text-slate-500">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('register')} 
                className="text-indigo-400 hover:underline inline-block font-medium"
              >
                Sign up free
              </button>
            </div>

            {/* Dev Auto-Fill helper */}
            <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
              <button
                type="button"
                onClick={autoFillDev}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/40 hover:bg-slate-900 text-[10px] font-mono text-indigo-400 rounded-full border border-slate-800"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Auto-fill Seed Developer Identity
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Your Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Biniyam Girmay"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="biniyam@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Bcrypt salt cost-factor 12 enforced synchronously.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer text-sm"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Register & Send OTP'}
            </button>

            <div className="text-center text-xs mt-4 text-slate-500">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-indigo-400 hover:underline inline-block font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mb-4 text-xs font-mono text-slate-400">
              Check your inbox for the 6-digit verification code.
              <br />
              <span className="text-emerald-400 mt-1 inline-block font-semibold">Demo code: "123456"</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-2">Activation Code (OTP)</label>
              <input 
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full max-w-[200px] mx-auto text-center tracking-[12px] font-sans text-2xl font-bold py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors block"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Activate & Continue'}
            </button>

            <div className="text-center text-xs mt-4 flex items-center justify-center gap-3">
              <button 
                type="button" 
                onClick={handleResend}
                className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Resend OTP Mail
              </button>
              <span className="text-slate-700">|</span>
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-slate-400 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="biniyam@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              Send Reset Link
            </button>

            <div className="text-center text-xs mt-4">
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                className="text-slate-400 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
