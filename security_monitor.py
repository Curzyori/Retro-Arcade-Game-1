import time
import re
import os

LOG_FILE = "error.log"

print("👁️  Eye of the Spirit is watching for temporal anomalies...")

def tail(file_path):
    if not os.path.exists(file_path):
        open(file_path, 'a').close()
        
    with open(file_path, "r") as file:
        # Go to the end of file
        file.seek(0, 2)
        while True:
            line = file.readline()
            if not line:
                time.sleep(0.5)
                continue
            yield line

if __name__ == "__main__":
    for line in tail(LOG_FILE):
        if "RATE LIMIT EXCEEDED" in line:
            # Extract IP using basic regex
            match = re.search(r"IP: ([\d\:\.]+)", line)
            ip = match.group(1) if match else "Unknown IP"
            print(f"🚨 [WARNING] Temporal Anomaly Detected! Brute-force attempt from IP: {ip}. Zafkiel's Wall has blocked it.")
