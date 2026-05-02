const express = require('express');
const engine = require('../../core/engine');
const { TimeShiftSchema } = require('../../utils/validation');
const { asyncWrapper } = require('../../utils/errors');
const logger = require('../../utils/logger');

const router = express.Router();

router.post('/time-shift', asyncWrapper(async (req, res) => {
  // Validate input
  const result = TimeShiftSchema.safeParse(req.body);
  
  if (!result.success) {
    logger.warn('Validation failed for /time-shift', { errors: result.error.format() });
    return res.status(400).json({ success: false, errors: result.error.format() });
  }

  const { player_id, action, shift_amount } = result.data;
  
  // Process game logic
  const engineResult = await engine.manipulateTime(player_id, action, shift_amount);
  
  res.json({
    success: true,
    data: engineResult
  });
}));

router.get('/player/:id', asyncWrapper(async (req, res) => {
  const playerId = req.params.id;
  const state = engine.getPlayerState(playerId);
  
  if (!state) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }

  const logs = engine.getPlayerLogs(playerId);

  res.json({ success: true, data: { ...state, logs } });
}));

module.exports = router;
