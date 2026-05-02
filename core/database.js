const Database = require('better-sqlite3');
const path = require('path');
const logger = require('../utils/logger');

const dbPath = path.resolve(__dirname, '../arcade.db');
const db = new Database(dbPath, { verbose: (msg) => logger.info(`[SQLite] ${msg}`) });

// Initialize database schema
const initDB = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        timePower REAL DEFAULT 100,
        score REAL DEFAULT 0,
        lastAction TEXT DEFAULT NULL
      );
      CREATE TABLE IF NOT EXISTS temporal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playerId TEXT,
        action TEXT,
        timestamp INTEGER,
        FOREIGN KEY(playerId) REFERENCES players(id)
      );
    `);
    logger.info('Database initialized successfully.');
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
  }
};

const getPlayer = (playerId) => {
  try {
    const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
    return stmt.get(playerId);
  } catch (error) {
    logger.error(`Failed to get player ${playerId}: ${error.message}`);
    return null;
  }
};

const savePlayer = (playerId, timePower, score, lastAction) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO players (id, timePower, score, lastAction)
      VALUES (@id, @timePower, @score, @lastAction)
      ON CONFLICT(id) DO UPDATE SET
        timePower = excluded.timePower,
        score = excluded.score,
        lastAction = excluded.lastAction
    `);
    stmt.run({ id: playerId, timePower, score, lastAction });
  } catch (error) {
    logger.error(`Failed to save player ${playerId}: ${error.message}`);
  }
};

const logAction = (playerId, action, timestamp) => {
  try {
    const stmt = db.prepare('INSERT INTO temporal_logs (playerId, action, timestamp) VALUES (?, ?, ?)');
    stmt.run(playerId, action, timestamp);
  } catch (error) {
    logger.error(`Failed to log action: ${error.message}`);
  }
};

const getRecentLogs = (playerId, limit = 5) => {
  try {
    const stmt = db.prepare('SELECT * FROM temporal_logs WHERE playerId = ? ORDER BY timestamp DESC LIMIT ?');
    return stmt.all(playerId, limit);
  } catch (error) {
    logger.error(`Failed to get logs: ${error.message}`);
    return [];
  }
};

initDB();

module.exports = {
  getPlayer,
  savePlayer,
  logAction,
  getRecentLogs
};
