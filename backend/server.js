/**
 * Real-Time IoT Backend Server
 * Subscribes to MQTT broker, stores data in SQLite, and exposes REST API
 */

const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Configuration (with environment variable support)
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'intern-test/bhargav/sensor-data';
const PORT = process.env.PORT || 5000;
const DB_FILE = process.env.DB_FILE || 'database.db';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('✗ Database connection error:', err.message);
    } else {
        console.log('✓ Connected to SQLite database');
        initializeDatabase();
    }
});

/**
 * Create measurements table if it doesn't exist
 */
function initializeDatabase() {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      temperature REAL NOT NULL,
      humidity INTEGER NOT NULL,
      status TEXT NOT NULL,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('✗ Error creating table:', err.message);
        } else {
            console.log('✓ Measurements table ready');
        }
    });
}

/**
 * Insert sensor data into database
 */
function insertMeasurement(data) {
    const insertSQL = `
    INSERT INTO measurements (sensor_id, timestamp, temperature, humidity, status)
    VALUES (?, ?, ?, ?, ?)
  `;

    const params = [
        data.sensor_id,
        data.timestamp,
        data.temperature,
        data.humidity,
        data.status
    ];

    db.run(insertSQL, params, function (err) {
        if (err) {
            console.error('✗ Error inserting data:', err.message);
        } else {
            console.log(`✓ Data saved (ID: ${this.lastID}) - Temp: ${data.temperature}°C, Humidity: ${data.humidity}%`);
        }
    });
}

// Connect to MQTT broker
console.log(`Connecting to MQTT broker: ${MQTT_BROKER}...`);
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('✓ Connected to MQTT broker');
    console.log(`✓ Subscribing to topic: ${MQTT_TOPIC}`);

    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('✗ Subscription error:', err);
        } else {
            console.log('✓ Successfully subscribed to topic\n');
        }
    });
});

mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log('\n[New MQTT Message Received]');
        console.log(`Topic: ${topic}`);
        console.log(`Payload:`, data);

        // Save to database
        insertMeasurement(data);
    } catch (error) {
        console.error('✗ Error processing message:', error.message);
    }
});

mqttClient.on('error', (error) => {
    console.error('✗ MQTT Error:', error);
});

// REST API Endpoints

/**
 * GET /api/metrics - Returns last 50 sensor readings
 */
app.get('/api/metrics', (req, res) => {
    const query = `
    SELECT 
      id,
      sensor_id,
      timestamp,
      temperature,
      humidity,
      status,
      received_at
    FROM measurements
    ORDER BY id DESC
    LIMIT 50
  `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('✗ Query error:', err.message);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            console.log(`✓ API Request: Returning ${rows.length} measurements`);
            res.json({
                success: true,
                count: rows.length,
                data: rows
            });
        }
    });
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        mqtt: mqttClient.connected,
        database: 'connected'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✓ Backend server running on port ${PORT}`);
    console.log(`✓ API endpoint: http://localhost:${PORT}/api/metrics`);
    console.log(`${'='.repeat(50)}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    mqttClient.end();
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('✓ Database connection closed');
        process.exit(0);
    });
});
