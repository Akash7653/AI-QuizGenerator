# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success",
  "status": "success"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "status": "error"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

**Response:** `UserResponse`

**Roles:** `student`, `teacher`, `admin`

---

### Login
**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body (form-data):**
```
username: john@example.com
password: SecurePass123
```

**Response:** `Token`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:** `Token`

---

### Get Profile
**GET** `/auth/profile`

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserResponse`

---

### Update Profile
**PUT** `/auth/profile`

Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "profile_image": "https://example.com/image.jpg"
}
```

**Response:** `UserResponse`

---

## Document Endpoints

### Upload Document
**POST** `/documents/upload`

Upload a document file for processing.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `file`: Document file (PDF, DOCX, TXT, PPTX)
- `title`: Document title (optional)
- `description`: Document description (optional)

**Response:** `DocumentUploadResponse`

**Supported File Types:** `pdf`, `docx`, `txt`, `pptx`

---

### Paste Text
**POST** `/documents/text`

Process pasted text as a document.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Notes",
  "content": "Paste your text content here...",
  "description": "Optional description"
}
```

**Response:** `DocumentUploadResponse`

---

### Fetch URL Content
**POST** `/documents/url`

Fetch and process content from a URL.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "description": "Optional description"
}
```

**Response:** `DocumentUploadResponse`

---

### Get All Documents
**GET** `/documents/`

Get all documents for the current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100)

**Response:** `List[DocumentResponse]`

---

### Get Document
**GET** `/documents/{document_id}`

Get a specific document by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `DocumentResponse`

---

### Delete Document
**DELETE** `/documents/{document_id}`

Delete a document.

**Headers:** `Authorization: Bearer <token>`

**Response:** 
```json
{
  "message": "Document deleted successfully"
}
```

---

## Quiz Endpoints

### Generate AI Quiz
**POST** `/quiz/generate`

Generate a quiz using AI from a document.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "document_id": 1,
  "mode": "practice",
  "total_questions": 10,
  "difficulty": "medium",
  "question_types": ["mcq", "true_false", "short_answer"]
}
```

**Quiz Modes:** `practice`, `exam`, `timed`, `untimed`, `adaptive`, `challenge`, `weak_topic`, `previous_mistakes`, `random`, `revision`, `topic_wise`, `mock_test`

**Response:** `QuizResponse`

---

### Create Manual Quiz
**POST** `/quiz/create`

Create a quiz manually with specific questions.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Custom Quiz",
  "description": "Quiz description",
  "mode": "practice",
  "total_questions": 5,
  "total_marks": 5.0,
  "duration": 600,
  "negative_marking": 0.25,
  "question_ids": [1, 2, 3, 4, 5]
}
```

**Response:** `QuizResponse`

---

### Start Quiz
**POST** `/quiz/start`

Start a quiz attempt.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quiz_id": 1
}
```

**Response:** `QuizAttemptResponse`

---

### Pause Quiz
**POST** `/quiz/pause/{attempt_id}`

Pause a quiz attempt.

**Headers:** `Authorization: Bearer <token>`

**Response:** `QuizAttemptResponse`

---

### Resume Quiz
**POST** `/quiz/resume/{attempt_id}`

Resume a paused quiz attempt.

**Headers:** `Authorization: Bearer <token>`

**Response:** `QuizAttemptResponse`

---

### Submit Quiz
**POST** `/quiz/submit`

Submit quiz answers for evaluation.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "attempt_id": 1,
  "answers": {
    "1": "A",
    "2": "True",
    "3": "The answer is..."
  }
}
```

**Response:** `QuizAttemptResponse`

---

### Get Quiz Result
**GET** `/quiz/result/{attempt_id}`

Get detailed quiz results.

**Headers:** `Authorization: Bearer <token>`

**Response:** `QuizResultResponse`

---

### Get Quiz History
**GET** `/quiz/history`

Get quiz attempt history for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100)

**Response:** `List[QuizAttemptResponse]`

---

## Analytics Endpoints

### Get Dashboard
**GET** `/analytics/dashboard`

Get comprehensive dashboard analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `DashboardResponse`

**Includes:**
- Overall accuracy
- Total quizzes attempted
- Daily/weekly/monthly progress
- Topic-wise performance
- Difficulty-wise performance
- Recent quizzes
- Weak and strong areas

---

### Get Performance Analysis
**GET** `/analytics/performance`

Get detailed performance analysis.

**Headers:** `Authorization: Bearer <token>`

**Response:** `PerformanceAnalysis`

**Includes:**
- Accuracy trends
- Speed analysis
- Difficulty progression
- Topic mastery
- Learning velocity
- Retention rate
- Improvement areas

---

### Get Topic Performance
**GET** `/analytics/topics`

Get topic-wise performance data.

**Headers:** `Authorization: Bearer <token>`

**Response:** Dictionary with topic performance metrics

---

### Get Difficulty Performance
**GET** `/analytics/difficulty`

Get difficulty-wise performance data.

**Headers:** `Authorization: Bearer <token>`

**Response:** Dictionary with difficulty performance metrics

---

## Recommendation Endpoints

### Get Recommendations
**GET** `/recommendation/`

Get personalized recommendations.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `recommendation_type`: Filter by type (optional)

**Response:** `List[RecommendationResponse]`

**Types:** `weak_topic`, `next_quiz`, `revision`, `next_topic`

---

### Generate Recommendations
**POST** `/recommendation/generate`

Generate new personalized recommendations.

**Headers:** `Authorization: Bearer <token>`

**Response:** `List[RecommendationResponse]`

---

### Get Learning Path
**GET** `/recommendation/learning-path`

Get personalized learning path.

**Headers:** `Authorization: Bearer <token>`

**Response:** `PersonalizedLearningPath`

**Includes:**
- Current level
- Recommended topics
- Recommended quizzes
- Revision schedule
- Weak topic focus
- Estimated completion time
- Learning objectives

---

### Complete Recommendation
**POST** `/recommendation/{recommendation_id}/complete`

Mark recommendation as completed.

**Headers:** `Authorization: Bearer <token>`

**Response:** Success message

---

### Dismiss Recommendation
**POST** `/recommendation/{recommendation_id}/dismiss`

Dismiss a recommendation.

**Headers:** `Authorization: Bearer <token>`

**Response:** Success message

---

## Admin Endpoints

### Get Admin Dashboard
**GET** `/admin/dashboard`

Get admin dashboard data.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** `AdminDashboardResponse`

**Includes:**
- Total users and active users
- Total quizzes and questions
- User growth statistics
- Quiz activity statistics
- Top performers
- Recent activities

---

### Get All Users
**GET** `/admin/users`

Get all users (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100)

**Response:** `List[UserManagementResponse]`

---

### Get All Quizzes
**GET** `/admin/quizzes`

Get all quizzes (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100)

**Response:** `List[QuizManagementResponse]`

---

### Get System Health
**GET** `/admin/system`

Get system health status.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** `SystemHealthResponse`

**Includes:**
- Database connection status
- Redis connection status
- Celery status
- Resource usage (CPU, memory, disk)
- Total counts

---

### Delete User
**DELETE** `/admin/user/{user_id}`

Delete a user (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** Success message

---

### Delete Quiz
**DELETE** `/admin/quiz/{quiz_id}`

Delete a quiz (admin only).

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** Success message

---

### Bulk Action
**POST** `/admin/bulk-action`

Perform bulk actions on entities.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "action": "delete",
  "entity_type": "user",
  "entity_ids": [1, 2, 3],
  "reason": "Inactive accounts"
}
```

**Actions:** `delete`, `activate`, `deactivate`
**Entity Types:** `user`, `quiz`, `question`

**Response:** `BulkActionResponse`

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1634567890
```

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100, max: 1000)

**Response includes:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 100,
  "total_pages": 2
}
```

---

## Question Types

The system supports the following question types:

1. **MCQ** - Multiple Choice Questions
2. **TRUE_FALSE** - True/False Questions
3. **FILL_IN_BLANK** - Fill in the Blank
4. **SHORT_ANSWER** - Short Answer Questions
5. **LONG_ANSWER** - Long Answer/Essay Questions
6. **CODING** - Programming/Coding Questions
7. **ASSERTION_REASON** - Assertion-Reason Questions
8. **CASE_STUDY** - Case Study Questions
9. **SCENARIO_BASED** - Scenario-based Questions

---

## Difficulty Levels

- **Easy** - Basic concepts, straightforward
- **Medium** - Moderate complexity, requires understanding
- **Hard** - Advanced concepts, complex problem-solving
- **Adaptive** - Dynamically adjusted based on performance

---

## Bloom's Taxonomy Levels

- **Remember** - Recall facts and basic concepts
- **Understand** - Explain ideas or concepts
- **Apply** - Use information in new situations
- **Analyze** - Draw connections among ideas
- **Evaluate** - Justify a stand or decision
- **Create** - Produce new or original work

---

## Webhooks

Webhooks can be configured for real-time notifications:

**Supported Events:**
- `quiz.completed` - Quiz attempt completed
- `quiz.started` - Quiz attempt started
- `user.registered` - New user registration
- `document.processed` - Document processing completed

Configure webhooks via admin panel or API.

---

## SDK Integration

Coming soon: Official SDKs for Python, JavaScript, and mobile platforms.

---

For interactive API documentation, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
