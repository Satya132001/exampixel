import os
import logging
from psycopg2 import pool

logger = logging.getLogger("backend_fastapi.db")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set.")
    raise SystemExit("DATABASE_URL environment variable is required")

# Threaded connection pool for blocking DB driver
try:
    conn_pool = pool.ThreadedConnectionPool(1, 5, dsn=DATABASE_URL)
    logger.info("PostgreSQL connection pool created")
except Exception as e:
    logger.exception("Failed to create DB pool: %s", e)
    raise


def _get_conn():
    """Get a connection from the pool."""
    return conn_pool.getconn()


def _put_conn(conn):
    """Return a connection to the pool."""
    try:
        conn_pool.putconn(conn)
    except Exception:
        try:
            conn.close()
        except Exception:
            pass


def execute(query, params=None, fetch=False):
    """Execute a query. If fetch=True return cur.fetchall()."""
    conn = _get_conn()
    try:
        cur = conn.cursor()
        cur.execute(query, params or ())
        if fetch:
            rows = cur.fetchall()
            cur.close()
            return rows
        else:
            conn.commit()
            cur.close()
            return None
    finally:
        _put_conn(conn)


def fetch_one(query, params=None):
    """Fetch a single row (tuple) or None."""
    conn = _get_conn()
    try:
        cur = conn.cursor()
        cur.execute(query, params or ())
        row = cur.fetchone()
        cur.close()
        return row
    finally:
        _put_conn(conn)


def fetch_all(query, params=None):
    """Fetch all rows for a query as a list of tuples."""
    conn = _get_conn()
    try:
        cur = conn.cursor()
        cur.execute(query, params or ())
        rows = cur.fetchall()
        cur.close()
        return rows
    finally:
        _put_conn(conn)


def test_connection():
    row = fetch_one("SELECT NOW()")
    return str(row[0]) if row else None
