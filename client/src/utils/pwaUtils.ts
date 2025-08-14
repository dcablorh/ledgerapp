// PWA utility functions
export class PWAUtils {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        
        console.log('Service Worker registered successfully:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Handle background sync registration
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          registration.sync.register('background-sync-transactions');
        }

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  static async requestBackgroundSync(tag: string): Promise<void> {
    if (this.swRegistration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.swRegistration.sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static addOnlineListener(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  static addOfflineListener(callback: () => void): void {
    window.addEventListener('offline', callback);
  }

  static removeOnlineListener(callback: () => void): void {
    window.removeEventListener('online', callback);
  }

  static removeOfflineListener(callback: () => void): void {
    window.removeEventListener('offline', callback);
  }

  private static showUpdateAvailable(): void {
    // Show update notification to user
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #3B82F6;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <span>A new version is available!</span>
        <button onclick="window.location.reload()" style="
          margin-left: 12px;
          background: white;
          color: #3B82F6;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Update Now</button>
        <button onclick="this.parentElement.remove()" style="
          margin-left: 8px;
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  static async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  static async showInstallPrompt(): Promise<void> {
    // This will be handled by the browser's install prompt
    // We can enhance this with custom UI if needed
  }
}

// Network status hook for React components
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    PWAUtils.addOnlineListener(handleOnline);
    PWAUtils.addOfflineListener(handleOffline);

    return () => {
      PWAUtils.removeOnlineListener(handleOnline);
      PWAUtils.removeOfflineListener(handleOffline);
    };
  }, []);

  return isOnline;
};