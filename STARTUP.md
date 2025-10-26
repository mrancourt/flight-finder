# Flight Finder Startup Guide

## Quick Start

To start both the backend server and frontend client with one command:

```bash
./start.sh
```

That's it! The script will:
- ✅ Create and activate a Python virtual environment
- ✅ Install all Python dependencies
- ✅ Check for Node.js and npm
- ✅ Install all Node.js dependencies
- ✅ Start the backend API server on http://localhost:8000
- ✅ Start the frontend dev server on http://localhost:5173

## Prerequisites

### Required
- **Python 3.x** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)

### Recommended
- **nvm** (Node Version Manager) - for easier Node.js version management
  - Install: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`

## Manual Setup (if needed)

### Backend Only
```bash
# Create venv
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Install dependencies
cd server
pip install -r requirements.txt

# Start server
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Only
```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Stopping the Servers

Press `Ctrl+C` in the terminal where `start.sh` is running. The script will automatically clean up both servers.

## Ports

- **Backend API**: http://localhost:8000
  - API docs: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

## Troubleshooting

### Port Already in Use
If you get an error about ports being in use, you can manually kill the processes:

```bash
# Kill backend
lsof -ti:8000 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9
```

### Missing flights.csv
If you don't have flight data yet, run the scraper:

```bash
python scrape_ua.py
```

### Node.js Version Issues
If you have nvm installed, the script will automatically use Node.js 20. You can also manually switch:

```bash
nvm use 20
# or
nvm install 20
nvm use 20
```

## What the Script Does

1. **Python Setup**
   - Checks for Python 3
   - Creates virtual environment if needed
   - Activates venv
   - Installs/updates dependencies from `server/requirements.txt`

2. **Node.js Setup**
   - Loads nvm if available
   - Uses version from `client/.nvmrc` if nvm is available
   - Checks for Node.js and npm
   - Installs dependencies from `client/package.json` if needed

3. **Server Startup**
   - Kills any existing processes on ports 8000 and 5173
   - Starts FastAPI backend with uvicorn
   - Starts Vite dev server for React frontend
   - Sets up cleanup handlers for graceful shutdown

4. **Monitoring**
   - Displays server URLs and PIDs
   - Waits for Ctrl+C to shut down
   - Automatically cleans up on exit

