# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import app
from database import Base, get_db
from models import register_audit_listeners

# Dedicated test database for isolated auth tests
TEST_DB_URL = "sqlite:///./test_auth_crm.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    register_audit_listeners()
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_google_login_with_direct_profile():
    """Test Google login when profile details are supplied directly from Google client."""
    payload = {
        "email": "demo.user@gmail.com",
        "name": "Nguyễn Quốc Khải",
        "avatar_url": "https://lh3.googleusercontent.com/a/demo-avatar",
        "google_id": "google_sub_1092837465",
        "company_name": "Nexus Tech Vietnam",
        "role_title": "Giám Đốc Kinh Doanh",
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "demo.user@gmail.com"
    assert data["user"]["fullName"] == "Nguyễn Quốc Khải"
    assert data["user"]["auth_provider"] == "google"
    assert data["user"]["workspaceName"] == "Nexus Tech Vietnam"


def test_google_login_with_credential_token():
    """Test Google login decoding ID token (unverified fallback or signed JWT)."""
    import jwt
    from datetime import datetime, timezone, timedelta

    # Simulate Google-issued ID token payload
    simulated_google_token = jwt.encode(
        {
            "iss": "https://accounts.google.com",
            "sub": "11823746501928374",
            "email": "enterprise.lead@gmail.com",
            "email_verified": True,
            "name": "Trần Thị Mai Anh",
            "picture": "https://lh3.googleusercontent.com/a/mai-anh-photo",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        "mock-google-key",
        algorithm="HS256"
    )

    payload = {
        "credential": simulated_google_token,
        "company_name": "VinTech Solutions",
        "role_title": "Trưởng Phòng RevOps",
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["user"]["email"] == "enterprise.lead@gmail.com"
    assert data["user"]["fullName"] == "Trần Thị Mai Anh"
    assert data["user"]["avatarUrl"] == "https://lh3.googleusercontent.com/a/mai-anh-photo"


def test_google_login_audit_log_created():
    """Test that Google login generates an audit log entry for system traceability."""
    payload = {
        "email": "audit.test@gmail.com",
        "name": "Audit Google Tester",
        "google_id": "google_audit_999",
    }
    res = client.post("/api/auth/google", json=payload)
    assert res.status_code == 200

    # Query audit logs
    audit_res = client.get("/api/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any("Google" in (log.get("new_value") or "") for log in logs["data"])


def test_get_current_user_profile():
    """Test accessing protected /api/auth/me endpoint with Bearer token."""
    login_res = client.post("/api/auth/google", json={"email": "profile.check@gmail.com", "name": "Profile Tester"})
    token = login_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "profile.check@gmail.com"
    assert me_data["fullName"] == "Profile Tester"
    assert me_data["auth_provider"] == "google"


def test_refresh_token_endpoint():
    """Test refreshing an access token via /api/auth/refresh."""
    login_res = client.post("/api/auth/google", json={"email": "refresh.test@gmail.com", "name": "Refresh Tester"})
    refresh_token = login_res.json()["refresh_token"]

    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["user"]["email"] == "refresh.test@gmail.com"


def test_google_login_missing_email_fails():
    """Test validation error when no email can be derived."""
    response = client.post("/api/auth/google", json={})
    assert response.status_code == 400
