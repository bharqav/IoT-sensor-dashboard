// Simple Backend for IoT Dashboard
// Hooks up to MQTT broker -> Saves to SQLite -> serves via API

const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Env vars or defaults
const BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
const TOPIC = process.env.MQTT_TOPIC || 'intern-test/bhargav/sensor-data';
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_FILE || 'database.db';

// Standard express setup
const app = express();
app.use(cors());
app.use(express.json());

// DB Setup
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('DB Error:', err.message);
    else {
        console.log('✓ DB Connected');
        initDB();
    }
});

// Make sure table exists
function initDB() {
    // Basic schema for sensor readings
    const sql = `
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_id TEXT,
      timestamp TEXT,
      temperature REAL,
      humidity INTEGER,
      status TEXT,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    db.run(sql, (err) => {
        if (err) console.error('Table create failed:', err);
    });
}

// Helper to save readings
function saveReading(data) {
    const sql = `
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

    db.run(sql, params, function (err) {
        if (err) console.error('Insert failed:', err.message);
        else console.log(`✓ Saved: ${data.temperature}°C / ${data.humidity}%`);
    });
}

// MQTT Setup
console.log(`Connecting to ${BROKER}...`);
const client = mqtt.connect(BROKER);

client.on('connect', () => {
    console.log('✓ MQTT Connected');

    client.subscribe(TOPIC, (err) => {
        if (!err) console.log(`✓ Listening on: ${TOPIC}\n`);
    });
});

// Handle incoming messages
client.on('message', (topic, msg) => {
    try {
        const payload = JSON.parse(msg.toString());
        console.log('-> New Msg:', payload);
        saveReading(payload);
    } catch (e) {
        console.error('Bad message format:', e.message);
    }
});

// API Routes
// ------------------------------

// Get latest 50 readings
app.get('/api/metrics', (req, res) => {
    // Just grab the newest stuff first
    const sql = `SELECT * FROM measurements ORDER BY id DESC LIMIT 50`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'DB failed' });
            return;
        }
        res.json({ success: true, count: rows.length, data: rows });
    });
});

// Basic health check
app.get('/health', (req, res) => {
    res.send({ status: 'ok', mqtt: client.connected });
});

// Start it up
app.listen(PORT, () => {
    console.log(`\n=== Backpack running on port ${PORT} ===`);
    console.log(`API: http://localhost:${PORT}/api/metrics\n`);
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\nClosing down...');
    client.end();
    db.close();
    process.exit();
});
