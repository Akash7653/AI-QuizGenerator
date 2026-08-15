import sqlite3

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.main import app, ensure_sqlite_user_schema
from app.config.settings import settings
from app.database.connection import SessionLocal
from app.database.schemas.user import UserCreate, UserUpdate
from app.database.services.auth_service import AuthService
from app.database.services.quiz_service import QuizService
from app.database.schemas.quiz import QuizCreate


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Create a clean test database session for each test."""
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM users"))
        db.commit()
        yield db
    finally:
        db.execute(text("DELETE FROM users"))
        db.commit()
        db.close()


def test_sqlite_legacy_name_column_is_migrated_to_username(tmp_path, monkeypatch):
    """Older SQLite databases use a legacy name column; the app should repair it before login/registration."""
    db_path = tmp_path / "legacy_users.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'student',
            created_at DATETIME,
            updated_at DATETIME
        )
        """
    )
    conn.execute(
        "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
        ("Legacy User", "legacy@example.com", "hashed-pass", "student"),
    )
    conn.commit()
    conn.close()

    monkeypatch.setattr(settings, "DATABASE_URL", f"sqlite:///{db_path}")
    ensure_sqlite_user_schema()

    conn = sqlite3.connect(db_path)
    columns = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
    assert "username" in columns
    assert conn.execute("SELECT username FROM users WHERE email = ?", ("legacy@example.com",)).fetchone()[0] == "Legacy User"
    conn.close()


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
    """Test user login using the session-based auth flow."""
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    auth_service.register_user(user_data)

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
                "name": "Analytics User",
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


def test_history_includes_previous_quizzes_without_attempts(db_session):
    """Users should still see their earlier quizzes in history even if no attempt record exists yet."""
    auth_service = AuthService(db_session)
    user = auth_service.register_user(UserCreate(
        name="History User",
        email="history@example.com",
        password="TestPass123",
        role="student"
    ))

    quiz_service = QuizService(db_session)
    quiz = quiz_service.create_quiz(QuizCreate(
        title="Previous Biology Quiz",
        description="Earlier quiz",
        total_questions=5,
        total_marks=5.0,
        duration=300,
        mode="practice",
    ), user.id)

    history = quiz_service.get_user_attempts_with_quiz_details(user.id)

    assert len(history) >= 1
    assert any(item["quiz_id"] == quiz.id for item in history)
    assert history[0]["topic"] == "Previous Biology Quiz"


def test_get_profile(client, db_session):
    """Test getting user profile via direct service call."""
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = auth_service.register_user(user_data)
    assert user.email == "test@example.com"
    assert user.username == "Test User"


def test_update_profile(client, db_session):
    """Test updating a user's profile via direct service call."""
    auth_service = AuthService(db_session)
    user_data = UserCreate(
        name="Test User",
        email="test@example.com",
        password="TestPass123",
        role="student"
    )
    user = auth_service.register_user(user_data)
    assert user.username == "Test User"

    updated = auth_service.update_user(user.id, UserUpdate(username="Updated Name"))
    assert updated.username == "Updated Name"
