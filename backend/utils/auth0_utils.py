from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError, JWTClaimsError
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import requests
from typing import Dict, Any
from functools import lru_cache
from loguru import logger

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")

security = HTTPBearer()

@lru_cache(maxsize=1)
def get_jwks() -> Dict[str, Any]:
    """
    Fetch JSON Web Key Set from Auth0
    Cached to avoid repeated requests
    """
    try:
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify token - Auth0 service unavailable"
        )

def get_rsa_key(token: str) -> Dict[str, Any]:
    """Get RSA key for JWT verification from Auth0 JWKS"""
    try:
        # Get unverified header to find the key ID
        unverified_header = jwt.get_unverified_header(token)
        
        # Get JWKS from Auth0
        jwks = get_jwks()
        
        # Find the key matching the token's kid
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return rsa_key
        
    except Exception as e:
        logger.error(f"Failed to get RSA key: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify JWT token from Auth0
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        token = credentials.credentials
        
        # Get RSA key for verification
        rsa_key = get_rsa_key(token)
        
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        
        logger.info(f"Token verified for user: {payload.get('sub')}")
        return payload
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token_data: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """
    Extract user information from verified token
    
    Args:
        token_data: Verified token payload
        
    Returns:
        User information dictionary
    """
    return {
        "user_id": token_data.get("sub"),
        "email": token_data.get("email"),
        "name": token_data.get("name"),
        "permissions": token_data.get("permissions", [])
    }
