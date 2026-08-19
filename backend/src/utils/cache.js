class Cache {
  constructor(ttl = 300000) { // 5 minutos por defecto
    this.store = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
  
  set(key, value) {
    this.store.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }
}

module.exports = new Cache();