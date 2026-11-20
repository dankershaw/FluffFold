import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Clean up any stale cache-first service workers and register network-first SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    caches.keys().then((keys) => {
      keys.forEach((k) => {
        if (k !== 'fluff-fold-v3') caches.delete(k);
      });
    });
    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update())
        .catch(() => {});
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
