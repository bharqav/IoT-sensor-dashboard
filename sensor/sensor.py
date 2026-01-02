#!/usr/bin/env python3
# mock sensor script
# basically pushes random data to mqtt so we have something to show in the ui

import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime, timezone

# connection details
# using the public emqx broker for now, easier than setting up local
BROKER = "broker.emqx.io"
PORT = 1883
TOPIC = "intern-test/bhargav/sensor-data"
DEVICE_ID = "sensor_001"

# callbacks for mqtt
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✓ connected to {BROKER}")
        print(f"✓ topic: {TOPIC}")
    else:
        print(f"✗ failed to connect, rc: {rc}")

def on_publish(client, userdata, mid):
    # just confirming it actually sent
    print(f"✓ msg {mid} sent")

# generates fake sensor values
def get_reading():
    # just random numbers that look realistic
    return {
        "sensor_id": DEVICE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature": round(random.uniform(20.0, 32.0), 2), # reasonable room temp range
        "humidity": random.randint(40, 80),
        "status": "active"
    }

def run():
    client = mqtt.Client()
    
    # hooking up the callbacks
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        print(f"connecting to {BROKER}...")
        client.connect(BROKER, PORT, 60)
        
        # bg thread for network stuff
        client.loop_start()
        time.sleep(1) 
        
        count = 0
        while True:
            # create payload and serialize
            data = get_reading()
            payload = json.dumps(data)
            
            # send it off
            client.publish(TOPIC, payload)
            
            count += 1
            print(f"\n[#{count}] pushed:")
            print(f"  temp: {data['temperature']}°C")
            print(f"  hum:  {data['humidity']}%")

            time.sleep(2) #change this value and the script sends value in those intervals
            
    except KeyboardInterrupt:
        print("\nstopping...")
    except Exception as e:
        print(f"crashed: {e}")
    finally:
        # cleanup
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run()
