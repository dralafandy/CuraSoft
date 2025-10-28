import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthApp from './frontend/AuthApp';
import { NotificationProvider } from './frontend/contexts/NotificationContext';
import { I18nProvider } from './frontend/contexts/I18nContext';
import { AuthProvider } from './frontend/contexts/AuthContext';
import ToastContainer from './frontend/components/ToastContainer';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <NotificationProvider>
        <AuthProvider>
          <AuthApp />
          <ToastContainer />
        </AuthProvider>
      </NotificationProvider>
    </I18nProvider>
  </React.StrictMode>
);