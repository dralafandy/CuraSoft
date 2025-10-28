import React from 'react';
import App from './App';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseClient';
import { useI18n } from './hooks/useI18n';

const BackendConfigMessage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">{t('auth.config.title')}</h1>
            <p className="text-slate-600 mt-2">{t('auth.config.message')}</p>
        </div>
        <div className="text-sm text-slate-700 bg-slate-100 p-4 rounded-lg">
          <p className="font-semibold">{t('auth.config.instructions')}</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Open the `backend_setup.md` file.</li>
            <li>Follow the steps to create a free Supabase project.</li>
            <li>Copy your project's URL and anon key.</li>
            <li>Add them as secrets named `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your environment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


const AuthApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center">
            <p>{useI18n().t('auth.loading')}</p>
        </div>
    );
  }

  if (!supabase) {
    return <BackendConfigMessage />;
  }

  if (user) {
    return <App />;
  }

  return <LoginPage />;
};

export default AuthApp;
