# Real-Time IoT Data Streamer

A complete full-stack application for real-time IoT sensor data streaming and visualization using MQTT, Node.js, and Next.js.

## 📋 Project Overview

This application demonstrates a real-time data pipeline that:
1. **Simulates IoT sensors** publishing environmental data (temperature, humidity)
2. **Processes and stores** incoming sensor data in a database
3. **Visualizes** the data in a modern, responsive web dashboard

## 🏗️ Architecture

```
┌─────────────────┐         MQTT         ┌─────────────────┐
│  Python Sensor  │ ───────────────────> │  Node.js Backend │
│   (Publisher)   │  broker.emqx.io      │   (Subscriber)   │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                                   │ SQLite
                                                   ▼
                                          ┌─────────────────┐
                                          │   Database      │
                                          │  (database.db)  │
                                          └────────┬────────┘
                                                   │
                                              REST API
                                                   │
                                          ┌────────▼────────┐
                                          │  Next.js Frontend│
                                          │   (Dashboard)    │
                                          └──────────────────┘
```

## 📁 Project Structure

```
project-root/
├── sensor/
│   ├── sensor.py           # Python MQTT publisher
│   └── requirements.txt    # Python dependencies
├── backend/
│   ├── server.js          # Node.js Express server
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Backend containerization
├── frontend/
│   ├── app/
│   │   ├── page.js        # Main dashboard component
│   │   ├── layout.js      # Root layout
│   │   └── globals.css    # Global styles
│   ├── package.json       # Frontend dependencies
│   ├── next.config.js     # Next.js configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── postcss.config.js  # PostCSS config
│   └── Dockerfile         # Frontend containerization
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.7+** (for sensor)
- **Node.js 18+** (for backend and frontend)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Option 1: Local Development

#### 1️⃣ Start the Mock Sensor

```bash
cd sensor
pip install -r requirements.txt
python sensor.py
```

The sensor will connect to `broker.emqx.io` and publish data every 2 seconds.

#### 2️⃣ Start the Backend Server

```bash
cd backend
npm install
npm start
```

Backend will run on **http://localhost:5000** and:
- Subscribe to MQTT topic: `intern-test/candidate-001/sensor-data`
- Store data in `database.db`
- Expose API endpoint: `GET /api/metrics`

#### 3️⃣ Start the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on **http://localhost:3000**

### Option 2: Docker Deployment

#### Backend

```bash
cd backend
docker build -t iot-backend .
docker run -p 5000:5000 iot-backend
```

#### Frontend

```bash
cd frontend
docker build -t iot-frontend .
docker run -p 3000:3000 iot-frontend
```

> **Note:** The sensor doesn't have a Dockerfile as it's designed to run locally for testing.

## 🔧 Configuration

### MQTT Settings

- **Broker:** `broker.emqx.io`
- **Port:** `1883`
- **Topic:** `intern-test/candidate-001/sensor-data`

### Data Format

```json
{
  "sensor_id": "sensor_001",
  "timestamp": "2026-01-01T15:45:30.123456+00:00",
  "temperature": 24.5,
  "humidity": 65,
  "status": "active"
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | GET | Returns last 50 sensor readings |
| `/health` | GET | Health check endpoint |

## 🎨 Features

### Python Sensor (`sensor.py`)
- ✅ Connects to public MQTT broker
- ✅ Publishes JSON data every 2 seconds
- ✅ Random temperature (20.0 - 30.0°C) and humidity (40-80%)
- ✅ ISO 8601 UTC timestamps
- ✅ Graceful shutdown handling

### Node.js Backend (`server.js`)
- ✅ MQTT subscriber with auto-reconnect
- ✅ SQLite database persistence
- ✅ RESTful API with CORS support
- ✅ Automatic table creation
- ✅ Error handling and logging
- ✅ Runs on port 5000

### Next.js Frontend (`app/page.js`)
- ✅ Real-time data polling (2-second intervals)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Status cards with latest readings
- ✅ Sortable data table with history
- ✅ Live status indicator
- ✅ Error and loading states
- ✅ Gradient background with clean design

## 📊 Dashboard Features

The frontend dashboard includes:

1. **Live Status Indicator** - Shows connection status with animated pulse
2. **Temperature Card** - Large display of current temperature
3. **Humidity Card** - Current humidity percentage
4. **Sensor Status Card** - Shows sensor ID and active status
5. **Data Table** - Historical readings with:
   - Timestamp
   - Sensor ID
   - Temperature
   - Humidity
   - Status badge

## 🐛 Troubleshooting

### Sensor not connecting to MQTT

```bash
# Check internet connectivity
ping broker.emqx.io

# Ensure no firewall blocking port 1883
```

### Backend not receiving data

1. Verify sensor is publishing: Check sensor console output
2. Check MQTT topic matches: `intern-test/candidate-001/sensor-data`
3. Restart backend server

### Frontend showing "Cannot connect to backend"

1. Ensure backend is running on port 5000
2. Check CORS is enabled in backend
3. Verify API endpoint: http://localhost:5000/api/metrics

### Docker build fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild with no cache
docker build --no-cache -t image-name .
```

## 📝 Development Notes

- The sensor uses `paho-mqtt` Python library
- Backend uses `mqtt.js`, `express`, `sqlite3`, and `cors`
- Frontend is built with Next.js 14 (App Router) and Tailwind CSS
- Database file (`database.db`) is created automatically
- All timestamps are in ISO 8601 UTC format

## 🔒 Security Considerations

> ⚠️ **Important:** This is a demonstration project using a public MQTT broker.

For production use:
- Use authenticated MQTT broker
- Implement API authentication (JWT, API keys)
- Use HTTPS for frontend and API
- Validate and sanitize all inputs
- Use environment variables for configuration
- Implement rate limiting
- Add data encryption

## 📈 Bonus Features (Optional Enhancements)

- [ ] Add alert if temperature exceeds 30°C
- [ ] Implement real-time WebSocket updates (instead of polling)
- [ ] Add charts/graphs for data visualization
- [ ] Support multiple sensors
- [ ] Add data export functionality (CSV, JSON)
- [ ] Implement data retention policies
- [ ] Add authentication and authorization

## 📄 License

This project is created for demonstration purposes.

## 👨‍💻 Author

Created as a Full Stack Engineering assignment demonstrating:
- Real-time data handling with MQTT
- Backend API development with Node.js
- Modern frontend development with Next.js
- Docker containerization
- Database operations with SQLite

---

**Enjoy building with IoT data! 🚀**
