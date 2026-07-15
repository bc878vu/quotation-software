import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import App from './App.jsx';
import './index.css';

/*
  Register PWA Service Worker.

  immediate: true means service worker registration
  starts as soon as the application loads.
*/
registerSW({
  immediate: true,

  onNeedRefresh() {
    console.log('A new version of the app is available.');
  },

  onOfflineReady() {
    console.log('Quotation software is ready to work offline.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);