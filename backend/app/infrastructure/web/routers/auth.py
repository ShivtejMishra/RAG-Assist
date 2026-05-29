from fastapi import APIRouter, Depends, HTTPException, status
from app.infrastructure.web.schemas import TenantCreate, UserLogin, LoginResponse, UserResponse
from app.infrastructure.web.auth_deps import get_current_user
from app.infrastructure.di import get_auth_use_cases
from app.use_cases.auth.auth_use_cases import AuthUseCases
from app.domain.models import User
from app.domain.exceptions import DomainException

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_tenant(
    payload: TenantCreate,
    auth_service: AuthUseCases = Depends(get_auth_use_cases)
):
    try:
        result = await auth_service.register_tenant_and_admin(
            tenant_name=payload.tenant_name,
            domain=payload.domain,
            admin_email=payload.admin_email,
            admin_password=payload.admin_password,
            admin_name=payload.admin_name
        )
        return {
            "message": "Tenant and administrator registered successfully.",
            "tenant_id": result["tenant"].id,
            "user_id": result["user"].id
        }
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=LoginResponse)
async def login(
    payload: UserLogin,
    auth_service: AuthUseCases = Depends(get_auth_use_cases)
):
    try:
        result = await auth_service.login_user(
            email=payload.email,
            password=payload.password
        )
        return result
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id
    }
