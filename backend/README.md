# AI Quiz Generator - Enterprise Backend

A production-ready, enterprise-grade backend for an AI-powered quiz generation system built with FastAPI, PostgreSQL, Redis, and Google Gemini API.

## 🚀 Features

### Core Functionality
- **AI-Powered Quiz Generation**: Automatically generate quizzes from various document types using Google Gemini API
- **Multi-Format Document Processing**: Support for PDF, DOCX, TXT, PPTX, web URLs, YouTube transcripts, and more
- **Advanced NLP Pipeline**: Text extraction, cleaning, chunking, keyword extraction, and summarization
- **Vector Database**: FAISS-based similarity search for RAG (Retrieval-Augmented Generation)
- **Multiple Question Types**: MCQ, True/False, Fill-in-the-blank, Short Answer, Long Answer, Coding, and more
- **Quiz Engine**: Multiple quiz modes (Practice, Exam, Timed, Adaptive, etc.)
- **Real-time Analytics**: Comprehensive performance tracking and learning analytics
- **Personalized Recommendations**: AI-driven learning path recommendations
- **Admin Panel**: Complete user and content management

### Technical Features
- **Authentication**: JWT-based auth with refresh tokens, role-based access control
- **Caching**: Redis-powered caching for optimal performance
- **Background Tasks**: Celery for asynchronous processing
- **Rate Limiting**: Configurable rate limiting for API protection
- **Comprehensive Logging**: Structured logging with Loguru
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Docker Support**: Complete containerization with Docker Compose
- **Testing**: Unit and integration tests with pytest

## 🛠️ Tech Stack

- **Backend Framework**: FastAPI 0.104+
- **Python**: 3.12+
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Cache**: Redis 7
- **Background Tasks**: Celery 5.3+
- **AI/ML**: 
  - Google Gemini API
  - LangChain
  - Sentence Transformers
  - FAISS Vector Database
  - spaCy, NLTK
- **Document Processing**: PyMuPDF, pdfplumber, python-docx, pytesseract
- **Deployment**: Docker, Docker Compose

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication APIs
│   │   ├── documents/         # Document processing APIs
│   │   ├── quiz/              # Quiz management APIs
│   │   ├── analytics/         # Analytics APIs
│   │   ├── recommendation/    # Recommendation APIs
│   │   └── admin/             # Admin panel APIs
│   ├── ai/                    # AI integration
│   │   ├── gemini.py          # Google Gemini client
│   │   ├── prompt_engine.py   # Prompt engineering
│   │   ├── question_generator.py
│   │   ├── validator.py       # Question validation
│   │   └── difficulty.py      # Difficulty prediction
│   ├── nlp/                   # NLP processing
│   │   ├── extractor.py       # Text extraction
│   │   ├── cleaner.py         # Text cleaning
│   │   ├── chunker.py         # Text chunking
│   │   ├── embedding.py       # Embedding generation
│   │   ├── keyword.py         # Keyword extraction
│   │   └── summary.py         # Text summarization
│   ├── database/              # Database layer
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── repository/        # Repository pattern
│   │   ├── services/          # Business logic
│   │   └── connection.py      # Database connection
│   ├── middleware/            # Custom middleware
│   │   ├── auth.py            # Authentication middleware
│   │   ├── cors.py            # CORS configuration
│   │   ├── rate_limit.py      # Rate limiting
│   │   └── logging.py         # Logging middleware
│   ├── tasks/                 # Celery background tasks
│   │   ├── document_tasks.py
│   │   ├── quiz_tasks.py
│   │   ├── analytics_tasks.py
│   │   ├── recommendation_tasks.py
│   │   └── maintenance_tasks.py
│   ├── utils/                 # Utility functions
│   │   ├── vector_db.py       # FAISS vector database
│   │   └── cache.py           # Redis cache manager
│   ├── config/                # Configuration
│   │   └── settings.py        # Application settings
│   ├── tests/                 # Test suite
│   └── main.py                # Application entry point
├── storage/                   # File storage
│   ├── uploads/               # Uploaded documents
│   └── vector_db/             # Vector database indexes
├── logs/                      # Application logs
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 15+
- Redis 7+
- Google Gemini API Key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AI-Quiz Generator/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up database**
```bash
# Create PostgreSQL database
createdb quiz_generator

# Run migrations (when Alembic is set up)
alembic upgrade head
```

6. **Start Redis**
```bash
redis-server
```

7. **Start the application**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker Deployment

1. **Build and start with Docker Compose**
```bash
docker-compose up -d
```

2. **Access services**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Flower (Celery Monitor): http://localhost:5555

3. **Stop services**
```bash
docker-compose down
```

## 📚 API Documentation

Once the application is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile

#### Documents
- `POST /api/v1/documents/upload` - Upload document file
- `POST /api/v1/documents/text` - Process pasted text
- `POST /api/v1/documents/url` - Fetch content from URL
- `GET /api/v1/documents/` - Get all documents
- `DELETE /api/v1/documents/{id}` - Delete document

#### Quiz
- `POST /api/v1/quiz/generate` - Generate AI quiz
- `POST /api/v1/quiz/create` - Create manual quiz
- `POST /api/v1/quiz/start` - Start quiz attempt
- `POST /api/v1/quiz/submit` - Submit quiz answers
- `GET /api/v1/quiz/result/{id}` - Get quiz results

#### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard data
- `GET /api/v1/analytics/performance` - Get performance analysis
- `GET /api/v1/analytics/topics` - Get topic performance

#### Recommendations
- `GET /api/v1/recommendation/` - Get recommendations
- `POST /api/v1/recommendation/generate` - Generate new recommendations
- `GET /api/v1/recommendation/learning-path` - Get learning path

#### Admin
- `GET /api/v1/admin/dashboard` - Get admin dashboard
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/system` - System health check

## 🔧 Configuration

Key environment variables in `.env`:

```env
# Application
APP_NAME=AI Quiz Generator
DEBUG=True
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_generator

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_auth.py
```

## 📊 Monitoring

### Celery Flower
Monitor background tasks at http://localhost:5555

### Logs
Application logs are stored in the `logs/` directory:
- `app.log` - General application logs
- `error.log` - Error logs

### Health Check
```bash
curl http://localhost:8000/health
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (Student, Teacher, Admin)
- Rate limiting to prevent abuse
- CORS configuration
- SQL injection protection via ORM
- XSS protection
- File upload validation

## 🚀 Deployment

### Production Considerations

1. **Set `DEBUG=False` in production**
2. **Use strong secret keys**
3. **Configure proper CORS origins**
4. **Set up HTTPS**
5. **Use a production WSGI server (Gunicorn)**
6. **Configure proper database connection pooling**
7. **Set up log rotation**
8. **Monitor system resources**
9. **Regular database backups**
10. **Implement proper error tracking**

### Deployment Platforms

The application is containerized and can be deployed to:
- **Docker Swarm**
- **Kubernetes**
- **AWS ECS/EKS**
- **Google Cloud Run**
- **Azure Container Instances**
- **Heroku**
- **Railway**
- **Render**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- FastAPI framework
- SQLAlchemy ORM
- Celery for background tasks
- FAISS for vector similarity search
- The open-source community

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the logs in the `logs/` directory

---

**Built with ❤️ using FastAPI and Google Gemini**
