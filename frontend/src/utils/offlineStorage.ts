// IndexedDB utilities for offline storage
class OfflineStorage {
  private dbName = 'UrbanITLedger';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineTransactions')) {
          db.createObjectStore('offlineTransactions', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('dashboardData')) {
          db.createObjectStore('dashboardData', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
      };
    });
  }

  async storeTransactions(transactions: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      transactions.forEach(txn => {
        store.put(txn);
      });
    });
  }

  async getTransactions(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async storeOfflineTransaction(transactionData: any, token: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineTransactions'], 'readwrite');
      const store = transaction.objectStore('offlineTransactions');

      const offlineTransaction = {
        data: transactionData,
        token,
        timestamp: Date.now()
      };

      const request = store.add(offlineTransaction);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async storeDashboardData(data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dashboardData'], 'readwrite');
      const store = transaction.objectStore('dashboardData');

      const request = store.put({ id: 'summary', ...data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDashboardData(): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dashboardData'], 'readonly');
      const store = transaction.objectStore('dashboardData');
      const request = store.get('summary');

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async storeReportData(reportId: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');

      const request = store.put({ id: reportId, ...data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getReportData(reportId: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.get(reportId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const offlineStorage = new OfflineStorage();