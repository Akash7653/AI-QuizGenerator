# 🚀 AI Quiz Generator - Integration & Running Guide

## 📋 Prerequisites

- **Backend**: Python 3.12+, PostgreSQL, Redis, Google Gemini API Key
- **Frontend**: Node.js 18+, npm
- **Docker**: Docker & Docker Compose (optional but recommended)

---

## 🔧 Backend Setup & Running

### 1. Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL=postgresql://quizuser:quizpassword@localhost:5432/quiz_generator

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Option A: Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

###  Option B: Manual Setup

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Start PostgreSQL and Redis (if not using Docker)
# Create database
createdb quiz_generator

# Run migrations (when implemented)
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

Backend will run on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

---

## 🎨 Frontend Setup & Running

### 1. Environment Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🔗 Backend-Frontend Integration

### What's Been Integrated

1. **API Client** (`src/lib/api.ts`)
   - Axios-based HTTP client
   - JWT token management with auto-refresh
   - API endpoints for all backend services
   - Request/response interceptors

2. **Authentication** (`src/hooks/use-auth-backend.ts`)
   - JWT-based authentication
   - Token storage in localStorage
   - Auto token refresh on 401 errors
   - Profile management

3. **Auth Page** (`src/views/AuthBackend.tsx`)
   - Sign in / Sign up forms
   - Backend authentication integration
   - Error handling with toast notifications

4. **Results Page Enhancement** (`src/views/Results.tsx`)
   - **Added Pie Chart** for performance breakdown
   - Visual representation of correct/incorrect/skipped answers
   - Uses Recharts library for data visualization

### API Endpoints Available

#### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

#### Documents
- `POST /api/v1/documents/upload` - Upload document
- `POST /api/v1/documents/text` - Paste text
- `POST /api/v1/documents/url` - Fetch from URL
- `GET /api/v1/documents/` - Get all documents
- `DELETE /api/v1/documents/{id}` - Delete document

#### Quiz
- `POST /api/v1/quiz/generate` - Generate AI quiz
- `POST /api/v1/quiz/create` - Create manual quiz
- `POST /api/v1/quiz/start` - Start quiz attempt
- `POST /api/v1/quiz/submit` - Submit quiz
- `GET /api/v1/quiz/result/{id}` - Get results
- `GET /api/v1/quiz/history` - Get quiz history

#### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard data
- `GET /api/v1/analytics/performance` - Performance analysis
- `GET /api/v1/analytics/topics` - Topic performance

#### Recommendations
- `GET /api/v1/recommendation/` - Get recommendations
- `POST /api/v1/recommendation/generate` - Generate recommendations
- `GET /api/v1/recommendation/learning-path` - Learning path

---

## 🎯 New Pie Chart Feature

### What's Added

A pie chart has been added to the Results page showing:
- **Correct answers** (green)
- **Incorrect answers** (red)
- **Skipped questions** (yellow)

### How It Works

1. **Automatic Data Visualization**
   - Automatically calculates answer distribution
   - Uses Recharts library for beautiful visualization
   - Interactive with tooltips and legend

2. **Real-time Updates**
   - Chart updates automatically when quiz is submitted
   - Reflects actual performance data from backend

3. **Responsive Design**
   - Works on desktop and mobile
   - Scales automatically with container

### Tech Stack
- **Recharts**: React charting library
- **Lucide Icons**: Icon library for the pie chart icon

---

## 📱 Complete Running Commands

### Backend (Terminal 1)

```bash
# Navigate to backend
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"

# Option 1: Docker (Recommended)
docker-compose up -d

# Option 2: Manual
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Terminal 2)

```bash
# Navigate to frontend
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### Celery Workers (Terminal 3 - Optional)

```bash
cd "C:\Users\akash\OneDrive\Desktop\AI-Quiz Generator\backend"

# Start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 🌐 Access Points

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Flower (Celery Monitor)**: http://localhost:5555

### Production URLs

Update the `.env` files with your production URLs:
- Frontend: Your domain
- Backend: Your API domain
- Database: Production database URL

---

## 🔧 Troubleshooting

### Frontend Import Issues (RESOLVED)

**Problem**: Module not found errors for `@/lib/*`, `@/views/*`, etc.

**Solution**: 
- Created `vite.config.ts` with path alias configuration
- Installed `axios` for API communication
- Path aliases now resolve correctly to `src/*`

### Backend Connection Issues

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Check CORS configuration in backend
3. Verify API URL in frontend `.env`
4. Check firewall settings

### Database Connection Issues

**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in backend `.env`
3. Verify database exists: `createdb quiz_generator`
4. Check connection permissions

### Redis Connection Issues

**Problem**: Backend can't connect to Redis

**Solutions**:
1. Ensure Redis is running: `redis-cli ping`
2. Check REDIS_URL in backend `.env`
3. Verify Redis is accessible on configured port

---

## 🚀 Deployment Commands

### Build for Production

```bash
# Backend
cd backend
docker-compose -f docker-compose.yml build

# Frontend
cd frontend
npm run build
```

### Deploy

#### Backend (Choose Platform)

**AWS Elastic Beanstalk:**
```bash
eb init quiz-generator-backend
eb create production-environment
eb deploy
```

**Google Cloud Run:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/quiz-generator-backend
gcloud run deploy quiz-generator-backend --image gcr.io/PROJECT_ID/quiz-generator-backend
```

**Render:**
- Connect GitHub repository
- Select Dockerfile
- Configure environment variables
- Deploy

#### Frontend

**Vercel:**
```bash
cd frontend
vercel
```

**Netlify:**
```bash
cd frontend
npm run build
netlify deploy --dir=dist
```

---

## 📊 Monitoring

### Backend Monitoring

- **Health Check**: `curl http://localhost:8000/health`
- **API Logs**: Check `backend/logs/app.log`
- **Celery Tasks**: http://localhost:5555 (Flower)

### Frontend Monitoring

- **Console**: Browser DevTools Console
- **Network Tab**: Check API calls in Network tab
- **React DevTools**: React component inspection

---

## 🎨 Customization

### Adding New API Endpoints

1. Add endpoint in backend (`app/api/`)
2. Add API function in `frontend/src/lib/api.ts`
3. Use in frontend components

### Adding New Chart Types

The frontend already has `recharts` installed. Add new charts:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Example line chart
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
  </LineChart>
</ResponsiveContainer>
```

---

## 🔐 Security Notes

### For Production

1. **Change all secret keys** in `.env` files
2. **Enable HTTPS** with SSL certificates
3. **Configure proper CORS origins**
4. **Use strong database passwords**
5. **Enable rate limiting** (already configured)
6. **Regular security updates**

### Backend Security

- JWT tokens with expiration
- Password hashing with bcrypt
- SQL injection protection via ORM
- XSS protection
- CSRF protection
- File upload validation

### Frontend Security

- Token storage in localStorage (consider httpOnly cookies for production)
- Input validation with Zod
- XSS protection via React
- HTTPS enforced in production

---

## 📝 Next Steps

1. **Set up Google Gemini API Key** in backend `.env`
2. **Configure PostgreSQL database** connection
3. **Start Redis server** (or use Docker Compose)
4. **Test authentication flow** (register → login → profile)
5. **Test document upload** and quiz generation
6. **Test pie chart** on results page
7. **Deploy to production** using provided deployment guide

---

## 🆘 Support

### Common Issues

**"Module not found" errors:**
- Ensure you're in the correct directory
- Run `npm install` in frontend directory
- Check `vite.config.ts` has correct path aliases

**Backend 500 errors:**
- Check backend logs in `logs/` directory
- Verify database connection
- Check environment variables

**Frontend connection refused:**
- Ensure backend is running on port 8000
- Check API URL in frontend `.env`
- Verify CORS configuration

---

## 🎉 Summary

Your AI Quiz Generator is now fully integrated with:

✅ **Enterprise Backend** with PostgreSQL, Redis, Celery, Google Gemini  
✅ **Frontend** with React, TypeScript, Tailwind CSS, Recharts  
✅ **Authentication** with JWT and role-based access  
✅ **Document Processing** with NLP and AI integration  
✅ **Quiz Generation** with 9 different question types  
✅ **Real-time Analytics** and performance tracking  
✅ **Personalized Recommendations**  
✅ **Pie Chart** for visual performance breakdown  
✅ **Docker deployment** ready  
✅ **Comprehensive API documentation**  

**Start building amazing quizzes! 🚀**
