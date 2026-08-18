from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import jwt
import logging
from ..config import db

logger = logging.getLogger("backend_fastapi.auth")
JWT_SECRET = os.environ.get('JWT_SECRET') or os.environ.get('JWT_SECRET') or 'change_me'
security = HTTPBearer()


async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials if credentials else None
    if not token:
        raise HTTPException(status_code=401, detail='Authorization required')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail='Invalid token payload')
        row = db.fetch_one("SELECT id, full_name, email, username FROM users WHERE id = %s", (user_id,))
        if not row:
            raise HTTPException(status_code=401, detail='User not found')
        user = {'id': row[0], 'full_name': row[1], 'email': row[2], 'username': row[3]}
        return user
    except jwt.ExpiredSignatureError:
        logger.warning("Expired token")
        raise HTTPException(status_code=401, detail='Token expired')
    except Exception as e:
        logger.exception("Auth failure")
        raise HTTPException(status_code=401, detail='Invalid auth token')
