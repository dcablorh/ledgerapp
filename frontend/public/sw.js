const CACHE_NAME = 'urban-it-ledger-v1';
const API_CACHE_NAME = 'urban-it-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/transactions',
  '/api/dashboard/summary',
  '/api/reports/monthly',
  '/api/reports/category'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline fallback for critical endpoints
            if (url.pathname === '/api/dashboard/summary') {
              return new Response(JSON.stringify({
                summary: {
                  totalIncome: 0,
                  totalExpenditure: 0,
                  netBalance: 0,
                  totalTransactions: 0
                },
                recentTransactions: []
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// Sync offline transactions when back online
async function syncOfflineTransactions() {
  try {
    // Get offline transactions from IndexedDB
    const offlineTransactions = await getOfflineTransactions();
    
    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${transaction.token}`
          },
          body: JSON.stringify(transaction.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineTransaction(transaction.id);
        }
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getOfflineTransactions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UrbanITLedger', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineTransactions'], 'readonly');
      const store = transaction.objectStore('offlineTransactions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeOfflineTransaction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UrbanITLedger', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineTransactions'], 'readwrite');
      const store = transaction.objectStore('offlineTransactions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}