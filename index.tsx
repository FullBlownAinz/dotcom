import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { HashRouter } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext.tsx';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AdminProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--fba-red)',
              color: 'var(--fba-white)',
              fontFamily: '"Share Tech Mono", monospace',
              borderRadius: '0px',
              border: '2px solid var(--fba-black)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: 'var(--fba-white)',
                secondary: 'var(--fba-red)',
              },
            },
            error: {
                iconTheme: {
                  primary: 'var(--fba-white)',
                  secondary: 'var(--fba-red)',
                },
              },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-center w-full">
                  {icon}
                  <div className="flex-1 mx-2 text-sm">{message}</div>
                  {t.type !== 'loading' && (
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="ml-2 p-1 hover:text-black transition-colors flex-shrink-0"
                        aria-label="Close notification"
                    >
                        <X size={18} />
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
      </AdminProvider>
    </HashRouter>
  </React.StrictMode>
);