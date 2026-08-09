"""
data/db.py — Postgres connection layer (SQLAlchemy).

Replaces the TinyDB JSON-file store (data/database.py previously wrote to
./data/neurolearn_db.json) with a real Postgres database. This directly
addresses the manuscript's claim of "PostgreSQL-backed persistence" —
which the shipped code did not actually implement (it used TinyDB) prior
to this change.

Configuration (env vars, all optional — sensible local-dev defaults below):
    DATABASE_URL   postgresql+psycopg2://user:pass@host:port/dbname
                   (if unset, built from the individual PG_* vars below)
    PG_HOST        default "localhost"
    PG_PORT        default "5432"
    PG_DB          default "neurolearn"
    PG_USER        default "neurolearn"
    PG_PASSWORD    default "neurolearn_dev_pw"  (change this in production!)
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from loguru import logger
from dotenv import load_dotenv

load_dotenv()   # Load variables from .env

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "neurolearn")
PG_USER = os.getenv("PG_USER", "neurolearn")
PG_PASSWORD = os.getenv("PG_PASSWORD", "neurolearn_dev_pw")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}",
)

# pool_pre_ping avoids "server closed the connection unexpectedly" errors
# after idle periods — cheap insurance for a long-running dev/demo server.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a request-scoped session, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Ensure the Postgres schema is current.

    FIX (remaining-things request): this used to be the ONLY schema
    setup mechanism, via Base.metadata.create_all() — which creates
    tables that don't exist yet, but does NOT add new columns to a
    table that already exists (hit this directly: adding
    User.last_active_date broke signup against an existing dev database
    until migrations were introduced). Real schema changes now go
    through Alembic (see migrations/, alembic.ini):

        alembic revision --autogenerate -m "add some_column"
        alembic upgrade head

    create_all() is kept as a zero-config fallback for a genuinely fresh
    database with no migration history yet — harmless no-op once Alembic
    has run, since create_all() only ever adds missing tables.
    """
    from data import models_orm  # noqa: F401 — registers models on Base.metadata
    Base.metadata.create_all(bind=engine)
    logger.success(f"Postgres schema ready at {PG_HOST}:{PG_PORT}/{PG_DB}")
    logger.info(
        "Run `alembic upgrade head` after pulling changes that add/modify "
        "columns on existing tables — create_all() alone won't apply those."
    )
