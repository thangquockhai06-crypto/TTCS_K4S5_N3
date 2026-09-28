import os
import sys
import pytest

server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from app.main import app
from app.database import get_db
from app.models.user import User
from fastapi.testclient import TestClient

client = TestClient(app)

def test_google_register_and_login():
    # 1. Đăng ký tài khoản Google mới
    payload = {
        "googleId": "google_uid_1001",
        "email": "test_social_google@nexus.vn",
        "fullName": "Nguyen Van Google",
        "avatarUrl": "https://example.com/avatar_google.png",
        "companyName": "Google VN Partner",
        "roleTitle": "GSuite Specialist"
    }
    res_reg = client.post("/api/v1/auth/google", json=payload)
    assert res_reg.status_code == 200
    data_reg = res_reg.json()
    assert "accessToken" in data_reg
    assert "refreshToken" in data_reg
    assert data_reg["user"]["email"] == payload["email"]
    assert data_reg["user"]["fullName"] == payload["fullName"]
    user_id = data_reg["user"]["id"]

    # 2. Đăng nhập lại bằng tài khoản Google đã có
    res_login = client.post("/api/v1/auth/google", json=payload)
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert data_login["user"]["id"] == user_id
    assert data_login["user"]["email"] == payload["email"]

def test_linkedin_register_and_login():
    # 1. Đăng ký tài khoản LinkedIn mới
    payload = {
        "email": "test_social_linkedin@nexus.vn",
        "fullName": "Tran Thi LinkedIn",
        "avatarUrl": "https://example.com/avatar_linkedin.png",
        "companyName": "LinkedIn VN Tech",
        "roleTitle": "Head of Talent"
    }
    res_reg = client.post("/api/v1/auth/linkedin", json=payload)
    assert res_reg.status_code == 200
    data_reg = res_reg.json()
    assert "accessToken" in data_reg
    assert data_reg["user"]["email"] == payload["email"]
    assert data_reg["user"]["fullName"] == payload["fullName"]
    user_id = data_reg["user"]["id"]

    # 2. Đăng nhập lại bằng tài khoản LinkedIn đã có
    res_login = client.post("/api/v1/auth/linkedin", json=payload)
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert data_login["user"]["id"] == user_id

def test_apple_register_and_login():
    # 1. Đăng ký tài khoản Apple mới
    payload = {
        "email": "test_social_apple@privaterelay.appleid.com",
        "fullName": "Le Van Apple",
        "companyName": "iOS Ecosystem Inc",
        "roleTitle": "Lead iOS Architect"
    }
    res_reg = client.post("/api/v1/auth/apple", json=payload)
    assert res_reg.status_code == 200
    data_reg = res_reg.json()
    assert "accessToken" in data_reg
    assert data_reg["user"]["email"] == payload["email"]
    assert data_reg["user"]["fullName"] == payload["fullName"]
    user_id = data_reg["user"]["id"]

    # 2. Đăng nhập lại bằng tài khoản Apple đã có
    res_login = client.post("/api/v1/auth/apple", json=payload)
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert data_login["user"]["id"] == user_id

def test_phone_register_and_login():
    test_phone = "0987654321"

    # 1. Gửi mã OTP
    otp_res = client.post("/api/v1/auth/phone/send-otp", json={"phoneNumber": test_phone})
    assert otp_res.status_code == 200
    otp_data = otp_res.json()
    assert "otpCode" in otp_data
    received_code = otp_data["otpCode"]

    # 2. Đăng ký tài khoản mới bằng OTP
    verify_payload = {
        "phoneNumber": test_phone,
        "otpCode": received_code,
        "fullName": "Pham Phone OTP",
        "companyName": "Viettel Telecom VN"
    }
    res_reg = client.post("/api/v1/auth/phone/verify", json=verify_payload)
    assert res_reg.status_code == 200
    data_reg = res_reg.json()
    assert "accessToken" in data_reg
    assert data_reg["user"]["fullName"] == "Pham Phone OTP"
    assert data_reg["user"]["email"] == f"{test_phone}@phone.nexuscrm.vn"

    # 3. Gửi OTP và Đăng nhập lại với tài khoản SĐT đã tồn tại
    otp_res_2 = client.post("/api/v1/auth/phone/send-otp", json={"phoneNumber": test_phone})
    assert otp_res_2.status_code == 200
    assert otp_res_2.json()["existingUser"] is not None
    code_2 = otp_res_2.json()["otpCode"]

    res_login = client.post("/api/v1/auth/phone/verify", json={
        "phoneNumber": test_phone,
        "otpCode": code_2,
    })
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert data_login["user"]["id"] == data_reg["user"]["id"]

def test_unified_social_endpoint():
    # Test cổng chung /api/v1/auth/social
    payload = {
        "provider": "google",
        "email": "test_unified_google@nexus.vn",
        "fullName": "Unified Google Test User",
    }
    res = client.post("/api/v1/auth/social", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == payload["email"]
