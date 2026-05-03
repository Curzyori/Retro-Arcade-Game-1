import sqlite3
import time
import random

DB_PATH = "arcade.db"

def generate_mock_data():
    print("⏳ Generating temporal anomalies (mock data)...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    player_id = "player_1"
    
    # Ensure player exists
    cursor.execute('''
        INSERT INTO players (id, timePower, score, lastAction)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
    ''', (player_id, 100, 0, 'none'))
    
    actions = ['backward', 'freeze', 'forward', 'accelerate']
    
    # Generate 15 random logs from the past 24 hours
    current_time = int(time.time() * 1000)
    for i in range(15):
        random_action = random.choice(actions)
        # Random time within the last 24 hours (86400000 ms)
        random_timestamp = current_time - random.randint(1000, 86400000)
        
        cursor.execute('''
            INSERT INTO temporal_logs (playerId, action, timestamp)
            VALUES (?, ?, ?)
        ''', (player_id, random_action, random_timestamp))
    
    conn.commit()
    conn.close()
    
    print("✨ Successfully injected 15 temporal records into arcade.db!")

if __name__ == "__main__":
    generate_mock_data()
