import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../hooks/useI18n';

const ToothIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10.5" />
    </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signUp } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setMessage(t('auth.signup.success'));
        setIsSignUp(false); // Switch to login view after successful signup
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center">
            <ToothIcon />
            <h1 className="text-3xl font-bold text-slate-800 mt-4">{t('appName')}</h1>
            <p className="text-slate-500">{isSignUp ? t('auth.signup.title') : t('auth.login.welcome')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
           {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {message && (
                 <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
                    <span className="block sm:inline">{message}</span>
                </div>
            )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">{t('auth.login.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-slate-700">{t('auth.login.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50"
          >
            {loading ? t('auth.loading') : (isSignUp ? t('auth.signup.button') : t('auth.login.button'))}
          </button>
        </form>
         <div className="text-center">
            <button 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setMessage(null);
                }}
                className="text-sm text-primary hover:underline"
            >
                {isSignUp ? t('auth.signup.backToLogin') : t('auth.login.noAccount')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
