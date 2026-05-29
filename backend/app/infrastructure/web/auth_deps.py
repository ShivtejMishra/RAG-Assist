from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.domain.models import User
from app.domain.exceptions import AuthenticationError, PermissionDeniedError
from app.infrastructure.di import get_auth_use_cases
from app.use_cases.auth.auth_use_cases import AuthUseCases

security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    auth_service: AuthUseCases = Depends(get_auth_use_cases)
) -> User:
    try:
        token = credentials.credentials
        user = await auth_service.get_current_user_from_token(token)
        return user
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of the following roles: {', '.join(self.allowed_roles)}"
            )
        return user

# Convenience dependency aliases
require_admin = RoleChecker(["admin"])
require_editor = RoleChecker(["admin", "editor"])
require_viewer = RoleChecker(["admin", "editor", "viewer"])
