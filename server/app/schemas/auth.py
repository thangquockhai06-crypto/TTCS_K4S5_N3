from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class LoginPayload(BaseModel):
    email: str
    password: str
    rememberMe: Optional[bool] = False

class RegisterPayload(BaseModel):
    fullName: str
    email: str
    companyName: Optional[str] = "NexusCRM Enterprise VN"
    roleTitle: Optional[str] = "Account Executive"
    password: str
    confirmPassword: Optional[str] = None

class RefreshTokenPayload(BaseModel):
    refreshToken: str

class UserDTO(BaseModel):
    id: str
    fullName: str = Field(..., serialization_alias="fullName")
    email: str
    role: str
    title: str
    department: str
    avatarUrl: Optional[str] = Field(None, serialization_alias="avatarUrl")
    workspaceName: str = Field(..., serialization_alias="workspaceName")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class AuthResponse(BaseModel):
    accessToken: str = Field(..., serialization_alias="accessToken")
    refreshToken: str = Field(..., serialization_alias="refreshToken")
    expiresIn: int = Field(..., serialization_alias="expiresIn")
    tokenType: str = Field("Bearer", serialization_alias="tokenType")
    user: UserDTO
    issuedAt: str = Field(..., serialization_alias="issuedAt")

    model_config = ConfigDict(populate_by_name=True)

class RefreshTokenResponseDTO(BaseModel):
    accessToken: str = Field(..., serialization_alias="accessToken")
    refreshToken: str = Field(..., serialization_alias="refreshToken")
    expiresIn: int = Field(..., serialization_alias="expiresIn")
    refreshedAt: str = Field(..., serialization_alias="refreshedAt")

    model_config = ConfigDict(populate_by_name=True)

class MessageResponse(BaseModel):
    message: str
    retryAfterSeconds: Optional[int] = None


class SocialAuthPayload(BaseModel):
    provider: str
    email: Optional[str] = None
    fullName: Optional[str] = Field(None, alias="full_name")
    companyName: Optional[str] = Field(None, alias="company_name")
    roleTitle: Optional[str] = Field(None, alias="role_title")
    hideAppleEmail: Optional[bool] = Field(False, alias="hide_apple_email")
    credential: Optional[str] = None
    avatarUrl: Optional[str] = Field(None, alias="avatar_url")
    sub: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class GoogleAuthPayload(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    fullName: Optional[str] = Field(None, alias="full_name")
    avatarUrl: Optional[str] = Field(None, alias="avatar_url")
    googleId: Optional[str] = Field(None, alias="google_id")
    companyName: Optional[str] = None
    roleTitle: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class LinkedInAuthPayload(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    fullName: Optional[str] = Field(None, alias="full_name")
    companyName: Optional[str] = None
    roleTitle: Optional[str] = None
    sub: Optional[str] = None
    avatarUrl: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class AppleAuthPayload(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    fullName: Optional[str] = Field(None, alias="full_name")
    sub: Optional[str] = None
    hideAppleEmail: Optional[bool] = False
    companyName: Optional[str] = None
    roleTitle: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class PhoneSendOtpPayload(BaseModel):
    phoneNumber: str = Field(..., alias="phone_number")

    model_config = ConfigDict(populate_by_name=True)


class PhoneSendOtpResponse(BaseModel):
    otpCode: str = Field(..., serialization_alias="otpCode")
    expiresInSeconds: int = Field(300, serialization_alias="expiresInSeconds")
    existingUser: Optional[UserDTO] = Field(None, serialization_alias="existingUser")

    model_config = ConfigDict(populate_by_name=True)


class PhoneVerifyOtpPayload(BaseModel):
    phoneNumber: str = Field(..., alias="phone_number")
    otpCode: str = Field(..., alias="otp_code")
    fullName: Optional[str] = Field(None, alias="full_name")
    companyName: Optional[str] = None
    roleTitle: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

