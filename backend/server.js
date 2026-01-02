// simple backend for iot dashboard
// hooks up mqtt -> sqlite -> api

const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// config vars
const BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
const TOPIC = process.env.MQTT_TOPIC || 'intern-test/bhargav/sensor-data';
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_FILE || 'database.db';

// express defaults
const app = express();
app.use(cors());
app.use(express.json());

// set up the database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('db error:', err.message);
    else {
        console.log('✓ db connected');
        initDB();
    }
});

// create table if needed
function initDB() {
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
        if (err) console.error('create table failed:', err);
    });
}

// insert data helper
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
        if (err) console.error('insert failed:', err.message);
        else console.log(`✓ saved: ${data.temperature}°C / ${data.humidity}%`);
    });
}

// mqtt connection stuff
console.log(`connecting to ${BROKER}...`);
const client = mqtt.connect(BROKER);

client.on('connect', () => {
    console.log('✓ mqtt connected');

    client.subscribe(TOPIC, (err) => {
        if (!err) console.log(`✓ listening on: ${TOPIC}\n`);
    });
});

// handling messages
client.on('message', (topic, msg) => {
    try {
        const payload = JSON.parse(msg.toString());
        console.log('-> msg received:', payload);
        saveReading(payload);
    } catch (e) {
        console.error('bad payload:', e.message);
    }
});

// api routes
// ------------------------------

// just get the last 50 readings
app.get('/api/metrics', (req, res) => {
    const sql = `SELECT * FROM measurements ORDER BY id DESC LIMIT 50`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'db failed' });
            return;
        }
        res.json({ success: true, count: rows.length, data: rows });
    });
});

// health check
app.get('/health', (req, res) => {
    res.send({ status: 'ok', mqtt: client.connected });
});

// start server
app.listen(PORT, () => {
    console.log(`\n=== backend running on port ${PORT} ===`);
    console.log(`api: http://localhost:${PORT}/api/metrics\n`);
});

// clean exit
process.on('SIGINT', () => {
    console.log('\nshutting down...');
    client.end();
    db.close();
    process.exit();
});
