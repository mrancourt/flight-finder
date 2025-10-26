# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
# Copy requirements and install dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy server code and data
COPY server/ ./server/
COPY flights.csv .
# Expose port
EXPOSE 8000
# Set environment variable
ENV FLIGHTS_CSV=/app/flights.csv
# Start server
CMD ["uvicorn", "server.server:app", "--host", "0.0.0.0", "--port", "8000"]
