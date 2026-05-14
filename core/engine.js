// Core Game Logic for Zafkiel Arcade
const db = require('./database');

class ZafkielEngine {
  async initializePlayer(playerId) {
    let player = await db.getPlayer(playerId);
    if (!player) {
      player = {
        id: playerId,
        timePower: 100, // Zafkiel time essence
        score: 0,
        lastAction: null
      };
      await db.savePlayer(player.id, player.timePower, player.score, player.lastAction);
    }
    return player;
  }

  async manipulateTime(playerId, action, amount) {
    const player = await this.initializePlayer(playerId);
    
    // Simulate time logic
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (action === 'forward' || action === 'accelerate') {
          player.timePower -= amount * 0.1;
          player.score += amount;
        } else if (action === 'backward' || action === 'freeze') {
          player.timePower -= amount * 0.5;
        }

        if (player.timePower < 0) player.timePower = 0;
        player.lastAction = action;
        
        // Persist to database
        await db.savePlayer(player.id, player.timePower, player.score, player.lastAction);
        const timestamp = Date.now();
        await db.logAction(player.id, action, timestamp);
        
        resolve({ player, action, timestamp });
      }, 50); // slight async delay for effect
    });
  }

  async getPlayerState(playerId) {
    return await db.getPlayer(playerId) || null;
  }

  async getPlayerLogs(playerId) {
    return await db.getRecentLogs(playerId) || [];
  }
}

module.exports = new ZafkielEngine();
