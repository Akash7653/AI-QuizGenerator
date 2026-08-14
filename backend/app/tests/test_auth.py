import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database.connection import SessionLocal
from app.database.schemas.user import UserCreate
from app.database.services.auth_service import AuthService


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Create test database session."""
    # In production, this would use a test database
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "TestPass123",
            "role": "student"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


def test_register_user_invalid_email(client):
    """Test user registration with invalid email."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
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
            "name": "Test User",
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
            "name": "Test User",
            "email": "test-long@example.com",
            "password": long_password,
            "role": "student"
        }
    )
    assert response.status_code == 422
    assert "72" in response.json()["detail"][0]["msg"]


def test_login_user(client, db_session):
    """Test user login."""
    # First register a user
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    auth_service.register_user(user_data)
    
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
    assert "access_token" in data
    assert "refresh_token" in data


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


def test_get_profile(client, db_session):
    """Test getting user profile."""
    # Register and login user
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = auth_service.register_user(user_data)
    
    # Get token
    token = auth_service.create_access_token(data={"sub": user.id})
    
    # Get profile
    response = client.get(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_update_profile(client, db_session):
    """Test updating user profile."""
    # Register and login user
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = auth_service.register_user(user_data)
    
    # Get token
    token = auth_service.create_access_token(data={"sub": user.id})
    
    # Update profile
    response = client.put(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
