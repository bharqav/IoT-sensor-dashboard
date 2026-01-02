#!/usr/bin/env python3
"""
Mock IoT Sensor - Real-Time Data Publisher
Publishes simulated sensor data to MQTT broker every 2 seconds
"""

import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime, timezone

# MQTT Configuration
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "intern-test/bhargav/sensor-data"
SENSOR_ID = "sensor_001"
PUBLISH_INTERVAL = 2  # seconds

def on_connect(client, userdata, flags, rc):
    """Callback for when the client connects to the broker"""
    if rc == 0:
        print(f"✓ Connected to MQTT Broker: {MQTT_BROKER}")
        print(f"✓ Publishing to topic: {MQTT_TOPIC}")
        print(f"✓ Interval: {PUBLISH_INTERVAL} seconds\n")
    else:
        print(f"✗ Connection failed with code {rc}")

def on_publish(client, userdata, mid):
    """Callback for when a message is published"""
    print(f"✓ Message {mid} published successfully")

def generate_sensor_data():
    """Generate random sensor data matching the required format"""
    data = {
        "sensor_id": SENSOR_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature": round(random.uniform(20.0, 32.0), 2),
        "humidity": random.randint(40, 80),
        "status": "active"
    }
    return data

def main():
    """Main function to initialize MQTT client and publish data"""
    # Create MQTT client
    client = mqtt.Client()
    
    # Attach callbacks
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        # Connect to broker
        print(f"Connecting to MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Start network loop in background
        client.loop_start()
        
        # Wait for connection
        time.sleep(2)
        
        # Publish data continuously
        message_count = 0
        while True:
            # Generate sensor data
            sensor_data = generate_sensor_data()
            
            # Convert to JSON
            json_payload = json.dumps(sensor_data)
            
            # Publish to MQTT topic
            result = client.publish(MQTT_TOPIC, json_payload)
            
            message_count += 1
            print(f"\n[Message #{message_count}]")
            print(f"Temperature: {sensor_data['temperature']}°C")
            print(f"Humidity: {sensor_data['humidity']}%")
            print(f"Timestamp: {sensor_data['timestamp']}")
            
            # Wait before next publish
            time.sleep(PUBLISH_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n✓ Sensor stopped by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print("✓ Disconnected from broker")

if __name__ == "__main__":
    main()
