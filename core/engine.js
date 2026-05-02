const db = require('./database');
const logger = require('../utils/logger');

class ZafkielEngine {
  constructor() {
    this.status = 'active';
  }

  async manipulateTime(playerId, action, shiftAmount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const player = this.getPlayerState(playerId) || { id: playerId, timePower: 100, score: 0 };
        
        // Logic for different actions
        if (action === 'backward') player.timePower += shiftAmount;
        if (action === 'forward') player.timePower -= shiftAmount;
        
        player.score += Math.abs(shiftAmount) * 0.1;
        player.lastAction = action;
        
        // Persist to database
        db.savePlayer(player.id, player.timePower, player.score, player.lastAction);
        const timestamp = Date.now();
        db.logAction(player.id, action, timestamp);
        
        resolve({ player, action, timestamp });
      }, 50); // slight async delay for effect
    });
  }

  getPlayerState(playerId) {
    return db.getPlayer(playerId) || null;
  }

  getPlayerLogs(playerId) {
    return db.getRecentLogs(playerId) || [];
  }
}

module.exports = new ZafkielEngine();
