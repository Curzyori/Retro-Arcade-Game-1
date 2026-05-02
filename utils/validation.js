const { z } = require('zod');

// Input validation for game state manipulations
const TimeShiftSchema = z.object({
  player_id: z.string().min(1, "Player ID is required"),
  shift_amount: z.number().int().min(-3600).max(3600, "Time shift must be between -3600 and 3600 seconds"),
  action: z.enum(['forward', 'backward', 'freeze', 'accelerate']),
});

module.exports = {
  TimeShiftSchema
};
