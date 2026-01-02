# Use a lightweight python image
FROM python:3.9-slim

# Set working directory to /app
WORKDIR /app

# Copy requirements first to leverage docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the sensor script
COPY sensor.py .

# Run the sensor script
CMD ["python", "sensor.py"]
