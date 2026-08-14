# 🔧 Quick Fix Guide - All Issues Resolved

## ✅ Issues Fixed

1. **faiss-cpu version updated** from 1.7.4 to 1.8.0 (compatible with Python 3.12)
2. **Docker Compose version** removed (obsolete attribute)
3. **GEMINI_API_KEY** placeholder updated in .env.example

---

## 🚀 Step-by-Step Fix Instructions

### Step 1: Create .env File

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
copy .env.example .env
```

Then edit `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your-actual-gemini-api-key
```

### Step 2: Install Python Dependencies

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
pip install -r requirements.txt
```

### Step 3: Start Docker Desktop

**IMPORTANT**: Docker Desktop must be running before using docker-compose

1. **Start Docker Desktop** from your Windows Start menu
2. Wait for Docker to fully start (look for the whale icon in system tray)
3. Verify Docker is running:
```bash
docker --version
docker ps
```

### Step 4: Option A - Docker Setup (Recommended)

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- FastAPI backend
- Celery worker
- Celery beat
- Flower monitoring

### Step 5: Option B - Manual Setup (If Docker fails)

#### Install PostgreSQL
1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. Create database:
```bash
createdb quiz_generator
```

#### Install Redis
1. Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
2. Start Redis server

#### Start Backend
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
python -m uvicorn app.main:app --reload
```

### Step 6: Start Frontend

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"
npm install
npm run dev
```

---

## 🔍 Troubleshooting Specific Errors

### Error: "faiss-cpu==1.7.4 not found"
**FIXED**: Updated to faiss-cpu==1.8.0 in requirements.txt

### Error: "Docker not running"
**FIX**: Start Docker Desktop first
1. Open Docker Desktop from Start menu
2. Wait for it to fully start
3. Run `docker ps` to verify

### Error: "uvicorn not recognized"
**FIX**: Install dependencies first
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
pip install -r requirements.txt
```

### Error: "celery not recognized"
**FIX**: Install dependencies first (same as above)

### Error: "GEMINI_API_KEY not set"
**FIX**: 
1. Create .env file: `copy .env.example .env`
2. Edit .env and add your API key

---

## 📋 Complete Setup Commands (Copy & Paste)

### Backend Setup
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY
pip install -r requirements.txt
```

### Docker Setup (Recommended)
```bash
# Make sure Docker Desktop is running first!
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
docker-compose up -d
```

### Manual Setup (If Docker fails)
```bash
# Start PostgreSQL and Redis manually first
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"
npm install
npm run dev
```

---

## 🌐 Access Points After Setup

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Flower (Celery Monitor)**: http://localhost:5555

---

## 🎯 Quick Test

After setup, test if everything works:

1. **Test Backend Health**:
```bash
curl http://localhost:8000/health
```

2. **Test API Documentation**:
Open http://localhost:8000/docs in browser

3. **Test Frontend**:
Open http://localhost:3000 in browser

---

## 💡 Important Notes

1. **Docker Desktop must be running** before using docker-compose
2. **Google Gemini API Key** is required for AI features
3. **PostgreSQL and Redis** are required for backend functionality
4. **Python 3.12** is required for all dependencies

---

## 🆘 Still Having Issues?

### Docker Issues
- Make sure Docker Desktop is installed and running
- Check Windows firewall settings
- Try running Docker Desktop as administrator

### Python Issues
- Make sure Python 3.12 is installed: `python --version`
- Try creating a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Database Issues
- Make sure PostgreSQL is running
- Check connection string in .env
- Try connecting with pgAdmin or psql

---

## 📞 Next Steps

1. **Get Google Gemini API Key**: https://makersuite.google.com/app/apikey
2. **Start Docker Desktop**
3. **Run the setup commands above**
4. **Test the application**
5. **Start building quizzes!**

---

**All issues have been fixed! Just follow the commands above.** 🎉
