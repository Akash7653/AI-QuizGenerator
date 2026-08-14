# 🔧 Manual Setup Guide (No Docker Required)

Since Docker Desktop has connection issues on your system, let's set up everything manually. This is actually better for development anyway!

---

## 🚀 Step-by-Step Manual Setup

### Step 1: Install Python Dependencies (Core)

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
pip install -r requirements-core.txt
```

This will install the core dependencies needed for basic functionality. If you need full AI features, we'll add those later.

### Step 2: Install PostgreSQL

Since we're not using Docker, you need PostgreSQL installed on Windows:

**Option A: Install PostgreSQL directly**
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set during installation
4. Create a database:
```bash
# Open SQL Shell (psql) from Start menu
# Or use pgAdmin to create database named "quiz_generator"
```

**Option B: Use cloud PostgreSQL (Easier)**
- Use Supabase (free): https://supabase.com
- Use Neon (free): https://neon.tech
- Get the connection string and update your .env file

### Step 3: Install Redis

**Option A: Install Redis on Windows**
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

**Option B: Use cloud Redis (Easier)**
- Use Redis Cloud (free tier): https://redis.com/try-free/
- Get the connection string and update your .env file

**Option C: Skip Redis for now (Will work with degraded performance)**
- The app will work without Redis but caching won't function

### Step 4: Configure Environment

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
copy .env.example .env
```

Edit `.env` file and update:

```env
# Database - Use your PostgreSQL connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/quiz_generator

# Redis - Use your Redis connection or comment out for now
REDIS_URL=redis://localhost:6379/0

# JWT - Generate secure keys
SECRET_KEY=generate-a-random-secret-key-here
JWT_SECRET_KEY=generate-another-random-secret-key-here

# Google Gemini - Add your API key
GEMINI_API_KEY=your-gemini-api-key
```

### Step 5: Create Database

```bash
# Using SQL Shell (psql)
CREATE DATABASE quiz_generator;
```

Or use pgAdmin to create the database visually.

### Step 6: Start Backend Server

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
python -m uvicorn app.main:app --reload
```

The backend will start on: http://localhost:8000

### Step 7: Start Frontend

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"
npm install
npm run dev
```

The frontend will start on: http://localhost:3000

---

## 🎯 Simplified Setup (Quick Start)

If you want to get started quickly without installing PostgreSQL and Redis:

### Use SQLite instead of PostgreSQL (Easiest)

Edit your `.env` file:
```env
DATABASE_URL=sqlite:///./quiz_generator.db
```

This will use a local SQLite file instead of PostgreSQL. No database installation needed!

### Skip Redis temporarily

Comment out Redis-related lines in `.env`:
```env
# REDIS_URL=redis://localhost:6379/0
# CELERY_BROKER_URL=redis://localhost:6379/1
# CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

Then run:
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
pip install -r requirements-core.txt
python -m uvicorn app.main:app --reload
```

---

## 🔍 Fix Docker Issue (If you want to use Docker later)

The Docker error `unable to connect to docker API at npipe:////./pipe/dockerDesktopLinuxEngine` suggests:

1. **Restart Docker Desktop**
   - Right-click Docker Desktop icon in system tray
   - Select "Restart"
   - Wait for it to fully restart

2. **Check Docker Settings**
   - Open Docker Desktop
   - Go to Settings → General
   - Make sure "Use the WSL 2 based engine" is checked
   - Apply & Restart

3. **Reset Docker**
   - Docker Desktop → Troubleshoot → Clean / Purge data
   - Restart Docker Desktop

4. **Alternative: Use WSL2**
   - Enable WSL2 in Windows
   - Install Docker inside WSL2
   - Run docker-compose from WSL2 terminal

---

## 📋 Complete Working Commands (Manual Setup)

```bash
# Step 1: Install core dependencies
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
pip install -r requirements-core.txt

# Step 2: Create .env file
copy .env.example .env

# Step 3: Edit .env and use SQLite for quick start
# Change DATABASE_URL to: sqlite:///./quiz_generator.db
# Comment out Redis lines

# Step 4: Start backend
python -m uvicorn app.main:app --reload

# Step 5: In new terminal, start frontend
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"
npm install
npm run dev
```

---

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 💡 Recommended Setup for Your Situation

Given the Docker issues, I recommend:

1. **Use SQLite** for database (no installation needed)
2. **Skip Redis** for now (app will work without it)
3. **Install core dependencies only** (requirements-core.txt)
4. **Run manually** with uvicorn

This will get you up and running immediately without needing to fix Docker or install PostgreSQL/Redis.

---

## 🆘 If You Still Have Issues

### Database Connection Error
- Make sure the database URL in .env is correct
- If using SQLite, the file will be created automatically
- If using PostgreSQL, make sure the service is running

### Port Already in Use
- Change the port in uvicorn command:
```bash
python -m uvicorn app.main:app --reload --port 8001
```

### Missing Dependencies
- Try installing each dependency separately to see which one fails
- Use `pip install <package_name>` for individual packages

---

## 🎉 Quick Start (Copy & Paste)

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
copy .env.example .env
# Edit .env: change DATABASE_URL to sqlite:///./quiz_generator.db
pip install -r requirements-core.txt
python -m uvicorn app.main:app --reload
```

Then in a new terminal:
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"
npm install
npm run dev
```

This will get you running immediately! 🚀
