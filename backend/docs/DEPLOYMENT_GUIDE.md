# Deployment Guide

This guide covers deploying the AI Quiz Generator backend to various platforms.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use the provided Docker setup)
- Redis server (or use the provided Docker setup)
- Google Gemini API key
- Domain name (for production)

## Environment Configuration

### Production Environment Variables

Create a `.env` file with the following variables:

```env
# Application
APP_NAME=AI Quiz Generator
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=<generate-strong-secret-key>
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://host:6379/0
REDIS_CACHE_TTL=3600

# JWT
JWT_SECRET_KEY=<generate-strong-jwt-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google Gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1024

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<your-app-password>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=AI Quiz Generator

# Celery
CELERY_BROKER_URL=redis://host:6379/1
CELERY_RESULT_BACKEND=redis://host:6379/2

# CORS
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=["pdf","docx","txt","pptx"]
UPLOAD_DIR=/app/storage/uploads

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Features
ENABLE_EMAIL_VERIFICATION=True
ENABLE_OCR=True
ENABLE_VECTOR_SEARCH=True
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd AI-Quiz Generator/backend
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your production values
```

3. **Build and start**
```bash
docker-compose up -d
```

4. **Check logs**
```bash
docker-compose logs -f backend
```

5. **Stop services**
```bash
docker-compose down
```

### Manual Docker Build

1. **Build the image**
```bash
docker build -t ai-quiz-generator:latest .
```

2. **Run the container**
```bash
docker run -d \
  --name ai-quiz-generator \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/logs:/app/logs \
  ai-quiz-generator:latest
```

## Cloud Platform Deployment

### AWS (Elastic Beanstalk)

1. **Create an Elastic Beanstalk application**
2. **Choose Docker platform**
3. **Upload your Dockerfile**
4. **Configure environment variables in the console**
5. **Set up RDS for PostgreSQL**
6. **Set up ElastiCache for Redis**
7. **Deploy**

### AWS (ECS/EKS)

1. **Push Docker image to ECR**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag ai-quiz-generator:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-quiz-generator:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-quiz-generator:latest
```

2. **Create ECS task definition**
3. **Configure load balancer**
4. **Deploy service**

### Google Cloud Run

1. **Build and push to Google Container Registry**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-quiz-generator
```

2. **Deploy to Cloud Run**
```bash
gcloud run deploy ai-quiz-generator \
  --image gcr.io/PROJECT_ID/ai-quiz-generator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Set environment variables**
```bash
gcloud run services update ai-quiz-generator \
  --set-env-vars DATABASE_URL=postgresql://...
```

### Azure Container Instances

1. **Push to Azure Container Registry**
```bash
az acr login --name <registry-name>
docker tag ai-quiz-generator <registry-name>.azurecr.io/ai-quiz-generator
docker push <registry-name>.azurecr.io/ai-quiz-generator
```

2. **Create container instance**
```bash
az container create \
  --resource-group myResourceGroup \
  --name ai-quiz-generator \
  --image <registry-name>.azurecr.io/ai-quiz-generator \
  --ports 8000 \
  --environment-variables DATABASE_URL=...
```

### Railway

1. **Connect your GitHub repository**
2. **Select the backend folder**
3. **Configure environment variables**
4. **Deploy**

### Render

1. **Create a new Web Service**
2. **Connect GitHub repository**
3. **Select Dockerfile**
4. **Configure environment variables**
5. **Deploy**

## Database Setup

### PostgreSQL

**Local Development:**
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Or using installed PostgreSQL
createdb quiz_generator
```

**Production:**
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- Configure connection pooling
- Enable SSL connections
- Set up automated backups

### Redis

**Local Development:**
```bash
# Using Docker
docker run --name redis -p 6379:6379 -d redis:7

# Or using installed Redis
redis-server
```

**Production:**
- Use managed Redis (AWS ElastiCache, Google Cloud Memorystore)
- Enable persistence
- Configure clustering for high availability

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy

1. **Create nginx.conf**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Run Nginx**
```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
  -v $(pwd)/certs:/etc/nginx/certs \
  nginx:alpine
```

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
```bash
curl https://yourdomain.com/health
```

2. **Flower (Celery Monitoring)**
```bash
# Access at http://yourdomain.com:5555
docker-compose up flower
```

### Log Management

1. **View logs**
```bash
# Docker logs
docker-compose logs -f backend

# Or view log files
tail -f logs/app.log
```

2. **Log Rotation**
- Configure logrotate for production
- Set up centralized logging (ELK stack, CloudWatch, etc.)

### Performance Monitoring

Consider using:
- **Prometheus + Grafana** for metrics
- **Sentry** for error tracking
- **New Relic** or **Datadog** for APM

## Security Considerations

### Production Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong, randomly generated secret keys
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Regular backups
- [ ] Monitor for suspicious activity

### Secrets Management

Use a secrets manager for production:
- **AWS Secrets Manager**
- **Google Secret Manager**
- **Azure Key Vault**
- **HashiCorp Vault**

## Backup Strategy

### Database Backups

```bash
# PostgreSQL backup
pg_dump -U username -h host -d dbname > backup.sql

# Automated backup script
0 2 * * * pg_dump -U username -h host -d dbname > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Application Backups

- Backup vector database indexes
- Backup uploaded files
- Backup configuration files

## Scaling

### Horizontal Scaling

1. **Load Balancer Setup**
- Use AWS ALB/NLB
- Use Nginx load balancing
- Use cloud provider load balancer

2. **Multiple Backend Instances**
```bash
# Scale with Docker Compose
docker-compose up -d --scale backend=3

# Or use Kubernetes with HPA
kubectl autoscale deployment backend --min=2 --max=10 --cpu-percent=80
```

### Vertical Scaling

- Increase CPU/memory allocation
- Optimize database queries
- Use caching effectively

## Troubleshooting

### Common Issues

**Database Connection Issues**
- Check DATABASE_URL
- Verify database is accessible
- Check firewall rules

**Redis Connection Issues**
- Verify Redis is running
- Check REDIS_URL
- Test connectivity

**High Memory Usage**
- Optimize database connection pool
- Check for memory leaks
- Adjust worker processes

**Slow Response Times**
- Enable caching
- Optimize database queries
- Use CDN for static files

## Maintenance

### Regular Tasks

1. **Database Maintenance**
```sql
VACUUM ANALYZE;
REINDEX DATABASE;
```

2. **Log Cleanup**
```bash
find logs/ -name "*.log" -mtime +30 -delete
```

3. **Backup Verification**
- Test restore procedures
- Verify backup integrity

4. **Dependency Updates**
```bash
pip list --outdated
pip install --upgrade <package>
```

## Support

For deployment issues:
- Check logs in `logs/` directory
- Review Docker logs: `docker-compose logs`
- Check health endpoint: `/health`
- Review API documentation: `/docs`

---

**Happy Deploying! 🚀**
