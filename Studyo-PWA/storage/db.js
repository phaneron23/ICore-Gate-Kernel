// ICore Studyo — IndexedDB Storage Layer v0.1.0
// All data stays on device. Zero external requests.

window.DB = {
  version: 1,
  dbName: 'icore-studyo',
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Verifications store
        if (!db.objectStoreNames.contains('verifications')) {
          const store = db.createObjectStore('verifications', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('trustLevel', 'trustLevel', { unique: false });
        }
        
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        console.error('DB init error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  async saveVerification(result) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('verifications', 'readwrite');
      const store = tx.objectStore('verifications');
      
      const record = {
        id: result.claim.id,
        text: result.claim.text,
        timestamp: result.timestamp,
        trustLevel: result.trust.level,
        trustScore: result.trust.score,
        trustLabel: result.trust.label,
        uscpScore: result.results.uscp.score,
        uscScore: result.results.usc.score,
        icsPassed: result.results.ics.summary.passed,
        icsTotal: result.results.ics.summary.total,
        fullResult: result
      };
      
      const request = store.add(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  },

  async getVerification(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('verifications', 'readonly');
      const store = tx.objectStore('verifications');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllVerifications() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('verifications', 'readonly');
      const store = tx.objectStore('verifications');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result || [];
        // Sort by timestamp, newest first
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async deleteVerification(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('verifications', 'readwrite');
      const store = tx.objectStore('verifications');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async getVerificationCount() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('verifications', 'readonly');
      const store = tx.objectStore('verifications');
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Settings
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  },

  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
};
