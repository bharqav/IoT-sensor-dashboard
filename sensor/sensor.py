#!/usr/bin/env python3
# Simple mock sensor script
# Just pushes random temp/humidity data to MQTT so we have something to visualize

import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime, timezone

# Config stuff
# Using public broker for testing, switch to private for prod
BROKER = "broker.emqx.io"
PORT = 1883
TOPIC = "intern-test/bhargav/sensor-data"
DEVICE_ID = "sensor_001"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✓ Connected to {BROKER}")
        print(f"✓ Target topic: {TOPIC}")
    else:
        print(f"✗ Failed to connect. Error code: {rc}")

def on_publish(client, userdata, mid):
    # Just confirming the message went out
    print(f"✓ Msg {mid} sent")

def get_reading():
    # Make up some believable numbers
    # active status just means it's working
    return {
        "sensor_id": DEVICE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature": round(random.uniform(20.0, 32.0), 2), # Random temp between 20-32C
        "humidity": random.randint(40, 80),
        "status": "active"
    }

def run():
    client = mqtt.Client()
    
    # Set up our callbacks
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        print(f"Connecting to {BROKER}...")
        client.connect(BROKER, PORT, 60)
        
        # Start the background thread for network traffic
        client.loop_start()
        time.sleep(1) # Give it a sec to connect
        
        count = 0
        while True:
            data = get_reading()
            payload = json.dumps(data)
            
            # Fire and forget
            client.publish(TOPIC, payload)
            
            count += 1
            print(f"\n[#{count}] Data pushed:")
            print(f"  Temp: {data['temperature']}°C")
            print(f"  Hum:  {data['humidity']}%")
            
            # Don't flood the broker
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nStopping...")
    except Exception as e:
        print(f"Crashed: {e}")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run()
