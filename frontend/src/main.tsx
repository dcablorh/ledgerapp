import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PWAUtils } from './utils/pwaUtils';
import { offlineStorage } from './utils/offlineStorage';


// Initialize PWA features
PWAUtils.registerServiceWorker();
offlineStorage.init();

// Initialize PWA features
PWAUtils.registerServiceWorker();
offlineStorage.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);