# tests/test_audit_logs.py
import os
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from models import register_audit_listeners, AuditLog, Deal, User, Customer
from app import app

TEST_DB_FILE = "test_audit_crm.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    """Setup clean test database before running tests and teardown afterwards."""
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

    Base.metadata.create_all(bind=test_engine)
    register_audit_listeners()

    yield

    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass


@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    # Clean all tables before each test function execution
    db.query(AuditLog).delete()
    db.query(Deal).delete()
    db.query(User).delete()
    db.query(Customer).delete()
    db.commit()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_audit_log_discount_and_quota_change(client):
    """
    Verifies that updating sensitive fields 'discount' or 'quota' automatically
    creates AuditLog records with performer, timestamp, old and new values.
    """
    create_resp = client.post(
        "/api/deals",
        json={
            "title": "Hop dong Vien thong Q3",
            "customer_id": "CUST-101",
            "stage": "Negotiation",
            "value": 500000000.0,
            "discount": 5.0,
            "quota": 1000000000.0,
            "owner": "Tran Van Quan Ly"
        },
        headers={
            "X-User-ID": "USR-888",
            "X-User-Name": "Nguyen Van Admin",
            "X-User-Email": "admin.nguyen@nexuscrm.vn"
        }
    )
    assert create_resp.status_code == 201
    deal_id = create_resp.json()["id"]

    # Update discount and quota (sensitive fields)
    update_resp = client.put(
        f"/api/deals/{deal_id}",
        json={
            "discount": 15.0,
            "quota": 1200000000.0,
        },
        headers={
            "X-User-ID": "USR-888",
            "X-User-Name": "Nguyen Van Admin",
            "X-User-Email": "admin.nguyen@nexuscrm.vn"
        }
    )
    assert update_resp.status_code == 200

    # Retrieve audit logs
    audit_resp = client.get("/api/audit-logs")
    assert audit_resp.status_code == 200
    data = audit_resp.json()["data"]

    field_names = [item["field_name"] for item in data]
    assert "discount" in field_names
    assert "quota" in field_names

    discount_log = next(item for item in data if item["field_name"] == "discount")
    assert discount_log["old_value"] == "5.0"
    assert discount_log["new_value"] == "15.0"
    assert discount_log["performed_by"] == "USR-888"
    assert discount_log["user_name"] == "Nguyen Van Admin"
    assert discount_log["target_type"] == "deals"


def test_audit_log_owner_change(client):
    """
    Verifies that changing data ownership ('owner') records an AuditLog.
    """
    create_resp = client.post(
        "/api/deals",
        json={
            "title": "Co hoi Enterprise SaaS",
            "customer_id": "CUST-202",
            "owner": "Le Van Sales A",
            "discount": 0.0,
            "quota": 50000000.0
        },
        headers={"X-User-ID": "USR-100", "X-User-Name": "Truong Phong Business"}
    )
    deal_id = create_resp.json()["id"]

    # Change owner
    client.put(
        f"/api/deals/{deal_id}",
        json={"owner": "Pham Thi Sales B"},
        headers={"X-User-ID": "USR-100", "X-User-Name": "Truong Phong Business"}
    )

    audit_resp = client.get("/api/audit-logs?target_type=deals")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()["data"]

    owner_log = next(item for item in logs if item["field_name"] == "owner")
    assert owner_log["old_value"] == "Le Van Sales A"
    assert owner_log["new_value"] == "Pham Thi Sales B"


def test_audit_log_user_role_change(client):
    """
    Verifies that modifying user role ('role') records an AuditLog entry.
    """
    create_resp = client.post(
        "/api/users",
        json={
            "name": "Hoang Minh Tri",
            "email": "tri.hoang@nexuscrm.vn",
            "group": "Kinh doanh Moi gioi",
            "role": "Sales Representative",
            "status": "active"
        }
    )
    assert create_resp.status_code == 201
    user_id = create_resp.json()["id"]

    # Update role to Sales Manager
    update_resp = client.put(
        f"/api/users/{user_id}",
        json={"role": "Sales Manager"},
        headers={"X-User-ID": "ADMIN-01", "X-User-Name": "Super Admin"}
    )
    assert update_resp.status_code == 200

    audit_resp = client.get("/api/audit-logs?target_type=users")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()["data"]

    role_log = next(item for item in logs if item["field_name"] == "role")
    assert role_log["old_value"] == "Sales Representative"
    assert role_log["new_value"] == "Sales Manager"
    assert role_log["performed_by"] == "ADMIN-01"


def test_audit_log_filtering_by_user_type_and_date(client):
    """
    Tests filtering audit logs by user, target object type, and date range.
    """
    # Create and update deal by User 1
    d1 = client.post("/api/deals", json={"title": "Deal 1", "customer_id": "1", "discount": 10.0}).json()["id"]
    client.put(
        f"/api/deals/{d1}",
        json={"discount": 20.0},
        headers={"X-User-ID": "USER-ALPHA", "X-User-Name": "User Alpha"}
    )

    # Create and update user role by User 2
    u1 = client.post("/api/users", json={"name": "User Beta", "email": "beta@nexus.vn", "group": "G", "role": "Viewer"}).json()["id"]
    client.put(
        f"/api/users/{u1}",
        json={"role": "Admin"},
        headers={"X-User-ID": "USER-BETA", "X-User-Name": "User Beta"}
    )

    # Filter by performed_by=USER-ALPHA
    res_alpha = client.get("/api/audit-logs?performed_by=USER-ALPHA").json()
    assert res_alpha["total_items"] == 1
    assert res_alpha["data"][0]["field_name"] == "discount"

    # Filter by target_type=users
    res_users = client.get("/api/audit-logs?target_type=users").json()
    assert res_users["total_items"] == 1
    assert res_users["data"][0]["field_name"] == "role"

    # Filter by date range
    now = datetime.utcnow()
    start_str = (now - timedelta(hours=1)).isoformat()
    end_str = (now + timedelta(hours=1)).isoformat()
    res_time = client.get(f"/api/audit-logs?start_date={start_str}&end_date={end_str}").json()
    assert res_time["total_items"] == 2
