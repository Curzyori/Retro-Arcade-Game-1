const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getPlayer = async (playerId) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows found"
      throw error;
    }
    return data || null;
  } catch (error) {
    logger.error(`Failed to get player ${playerId}: ${error.message}`);
    return null;
  }
};

const savePlayer = async (playerId, timePower, score, lastAction) => {
  try {
    const { error } = await supabase
      .from('players')
      .upsert({ 
        id: playerId, 
        timePower: timePower, 
        score: score, 
        lastAction: lastAction 
      }, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    logger.error(`Failed to save player ${playerId}: ${error.message}`);
  }
};

const logAction = async (playerId, action, timestamp) => {
  try {
    const { error } = await supabase
      .from('temporal_logs')
      .insert({ 
        playerId: playerId, 
        action: action, 
        timestamp: timestamp 
      });

    if (error) throw error;
  } catch (error) {
    logger.error(`Failed to log action: ${error.message}`);
  }
};

const getRecentLogs = async (playerId, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('temporal_logs')
      .select('*')
      .eq('playerId', playerId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error(`Failed to get logs: ${error.message}`);
    return [];
  }
};

module.exports = {
  getPlayer,
  savePlayer,
  logAction,
  getRecentLogs
};
