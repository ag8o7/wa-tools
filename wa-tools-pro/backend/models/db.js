/**
 * Simple JSON-based Database Helper
 * Use MongoDB in production by replacing these methods
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = {
  /**
   * Read a collection (JSON file)
   */
  read(collection) {
    const file = path.join(DATA_DIR, `${collection}.json`);
    if (!fs.existsSync(file)) return [];
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      return [];
    }
  },

  /**
   * Write to a collection
   */
  write(collection, data) {
    const file = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  },

  /**
   * Find items matching a query object
   */
  find(collection, query = {}) {
    const data = this.read(collection);
    return data.filter(item =>
      Object.keys(query).every(key => item[key] === query[key])
    );
  },

  /**
   * Find one item
   */
  findOne(collection, query = {}) {
    return this.find(collection, query)[0] || null;
  },

  /**
   * Insert a new item (auto-assigns id)
   */
  insert(collection, item) {
    const data = this.read(collection);
    const newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item
    };
    data.push(newItem);
    this.write(collection, data);
    return newItem;
  },

  /**
   * Update items matching a query
   */
  update(collection, query, updates) {
    const data = this.read(collection);
    let updated = null;
    const newData = data.map(item => {
      if (Object.keys(query).every(key => item[key] === query[key])) {
        updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return item;
    });
    this.write(collection, newData);
    return updated;
  },

  /**
   * Delete items matching a query
   */
  remove(collection, query) {
    const data = this.read(collection);
    const newData = data.filter(item =>
      !Object.keys(query).every(key => item[key] === query[key])
    );
    this.write(collection, newData);
    return data.length - newData.length;
  },

  /**
   * Count items
   */
  count(collection, query = {}) {
    return this.find(collection, query).length;
  }
};

module.exports = db;
