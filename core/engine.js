// Core Game Logic for Zafkiel Arcade
const db = require('./database');

class ZafkielEngine {
  initializePlayer(playerId) {
    let player = db.getPlayer(playerId);
    if (!player) {
      player = {
        id: playerId,
        timePower: 100, // Zafkiel time essence
        score: 0,
        lastAction: null
      };
      db.savePlayer(player.id, player.timePower, player.score, player.lastAction);
    }
    return player;
  }

  async manipulateTime(playerId, action, amount) {
    const player = this.initializePlayer(playerId);
    
    // Simulate time logic
    return new Promise((resolve) => {
      setTimeout(() => {
        if (action === 'forward' || action === 'accelerate') {
          player.timePower -= amount * 0.1;
          player.score += amount;
        } else if (action === 'backward' || action === 'freeze') {
          player.timePower -= amount * 0.5;
        }

        if (player.timePower < 0) player.timePower = 0;
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
