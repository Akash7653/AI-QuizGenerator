import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.schemas.user import UserCreate, UserUpdate
from app.database.services.auth_service import AuthService
from app.database.services.quiz_service import QuizService
from app.database.schemas.quiz import QuizCreate


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "Test User",
            "email": "test@example.com",
            "password": "TestPass123",
            "role": "student"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "Test User"


def test_register_user_invalid_email(client):
    """Test user registration with invalid email."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "Test User",
            "email": "invalid-email",
            "password": "TestPass123",
            "role": "student"
        }
    )
    assert response.status_code == 422


def test_register_user_weak_password(client):
    """Test user registration with weak password."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "Test User",
            "email": "test2@example.com",
            "password": "weak",
            "role": "student"
        }
    )
    assert response.status_code == 422


def test_register_user_password_too_long(client):
    """Test user registration rejects passwords exceeding bcrypt's 72-byte limit."""
    long_password = "A" * 80 + "b1C!"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "Test User",
            "email": "test-long@example.com",
            "password": long_password,
            "role": "student"
        }
    )
    assert response.status_code == 422
    assert "72" in response.json()["detail"][0]["msg"]


def test_login_user(client):
    """Test user login using the session-based auth flow."""
    # First register
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "Test User",
            "email": "test@example.com",
            "password": "TestPass123",
            "role": "student"
        }
    )
    assert register_response.status_code == 201

    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "TestPass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "Test User"


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_dashboard_returns_empty_analytics_for_new_user():
    """New users should receive a valid empty analytics payload instead of a 500 validation error."""
    with TestClient(app) as client:
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "Analytics User",
                "email": "analytics@example.com",
                "password": "TestPass123",
                "role": "student"
            }
        )
        assert register_response.status_code == 201

        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "analytics@example.com",
                "password": "TestPass123"
            }
        )
        assert login_response.status_code == 200

        dashboard_response = client.get("/api/v1/analytics/dashboard")
        assert dashboard_response.status_code == 200
        body = dashboard_response.json()
        assert body["total_quizzes_attempted"] == 0
        assert body["overall_accuracy"] == 0
        assert isinstance(body["topic_performance"], dict)
        assert isinstance(body["daily_progress"], list)


def test_get_profile(client):
    """Test getting user profile via direct service call."""
    auth_service = AuthService()
    user_data = UserCreate(
        username="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = await auth_service.register_user(user_data)
    assert user.email == "test@example.com"
    assert user.username == "Test User"


def test_update_profile(client):
    """Test updating a user's profile via direct service call."""
    auth_service = AuthService()
    user_data = UserCreate(
        username="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = await auth_service.register_user(user_data)
    assert user.username == "Test User"

    updated = await auth_service.update_user(user.id, UserUpdate(username="Updated Name"))
    assert updated.username == "Updated Name"
