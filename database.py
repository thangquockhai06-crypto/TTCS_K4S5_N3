# database.py
import contextvars
from typing import Generator, Optional, Dict, Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./crm.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Context variable to hold user information for audit trail during requests
current_user_ctx: contextvars.ContextVar[Optional[Dict[str, Any]]] = contextvars.ContextVar(
    "current_user_ctx", default=None
)


def get_db() -> Generator:
    """Dependency for obtaining database sessions in FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables and run lightweight SQLite column migrations."""
    Base.metadata.create_all(bind=engine)
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        with engine.connect() as conn:
            try:
                res = conn.exec_driver_sql("PRAGMA table_info(users)")
                existing_cols = {row[1] for row in res.fetchall()}
                new_columns = [
                    ("auth_provider", "VARCHAR(50) DEFAULT 'local'"),
                    ("google_id", "VARCHAR(100)"),
                    ("avatar_url", "VARCHAR(500)"),
                    ("hashed_password", "VARCHAR(255)"),
                ]
                for col_name, col_def in new_columns:
                    if col_name not in existing_cols:
                        conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
                conn.commit()
            except Exception:
                pass

