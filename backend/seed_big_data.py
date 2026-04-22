import urllib.request
import json
import random
import time

BASE_URL = "http://localhost:8005/api"

categories = ["Roads", "Water", "Electricity", "Garbage", "Traffic", "Health"]
actions = ["Pothole reported", "Water leak", "Street light out", "Garbage not collected", "Traffic signal malfunctioning", "Drainage overflow"]
locations = [
    "London, UK", 
    "New York, USA", 
    "Tokyo, Japan", 
    "Paris, France", 
    "Sydney, Australia", 
    "Berlin, Germany", 
    "Mumbai, India", 
    "São Paulo, Brazil", 
    "Dubai, UAE", 
    "Toronto, Canada",
    "Singapore",
    "Cape Town, South Africa",
    "San Francisco, USA",
    "Seoul, South Korea",
    "Mexico City, Mexico"
]

def seed_100_complaints():
    print("🚀 Initializing Global Big Data Ingestion Event...")
    
    for i in range(100):
        category = random.choice(categories)
        location = random.choice(locations)
        # Random Global Coordinates
        lat = random.uniform(-60, 70)
        lon = random.uniform(-120, 140)
        
        desc = f"{random.choice(actions)} in {location}. Detected via Global Satellite / IoT. Requires precision routing."
        
        payload = {
            "description": desc,
            "location": location,
            "category": category,
            "latitude": lat,
            "longitude": lon,
            "source": "Global Data Network / AI Ingestion"
        }
        
        req = urllib.request.Request(
            f"{BASE_URL}/complaints", 
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        try:
            with urllib.request.urlopen(req) as f:
                res = json.loads(f.read().decode('utf-8'))
                print(f"✅ [{i+1}/100] Ingested: {res['id']} - {category}")
        except Exception as e:
            print(f"⚠️ Error on entry {i+1}: {e}")
        
        # Artificial delay for streaming feel
        if i % 10 == 0:
            time.sleep(0.3)

if __name__ == "__main__":
    seed_100_complaints()
    print("\n📊 Ingestion complete. 100 high-velocity data points committed to Data Lake.")
