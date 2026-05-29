from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt
from app.domain.interfaces import IUserRepository, ITenantRepository
from app.domain.models import User, Tenant, TenantSettings
from app.domain.exceptions import AuthenticationError, RegistrationError

class AuthUseCases:
    def __init__(
        self, 
        user_repo: IUserRepository, 
        tenant_repo: ITenantRepository,
        jwt_secret: str,
        jwt_algorithm: str = "HS256",
        access_token_expire_minutes: int = 1440
    ):
        self.user_repo = user_repo
        self.tenant_repo = tenant_repo
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm
        self.access_token_expire_minutes = access_token_expire_minutes

    def hash_password(self, password: str) -> str:
        # Generate salt and hashpassword directly using bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'), 
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.jwt_secret, algorithm=self.jwt_algorithm)

    async def register_tenant_and_admin(
        self, 
        tenant_name: str, 
        domain: str, 
        admin_email: str, 
        admin_password: str,
        admin_name: str
    ) -> Dict[str, Any]:
        # Check if tenant domain already exists
        existing_tenant = await self.tenant_repo.get_by_domain(domain)
        if existing_tenant:
            raise RegistrationError(f"Tenant domain '{domain}' is already registered.")

        # Check if user email already exists
        existing_user = await self.user_repo.get_by_email(admin_email)
        if existing_user:
            raise RegistrationError(f"Email '{admin_email}' is already registered.")

        # 1. Create Tenant
        tenant = Tenant(
            name=tenant_name,
            domain=domain.lower(),
            settings=TenantSettings()
        )
        await self.tenant_repo.save(tenant)

        # 2. Create Admin User
        hashed_password = self.hash_password(admin_password)
        user = User(
            tenant_id=tenant.id,
            email=admin_email.lower(),
            hashed_password=hashed_password,
            full_name=admin_name,
            role="admin",
            status="active"
        )
        await self.user_repo.save(user)

        return {"tenant": tenant, "user": user}

    async def login_user(self, email: str, password: str) -> Dict[str, Any]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password.")
        
        if user.status != "active":
            raise AuthenticationError("User account is inactive.")

        # Check Tenant status
        tenant = await self.tenant_repo.get_by_id(user.tenant_id)
        if not tenant or tenant.status != "active":
            raise AuthenticationError("Tenant organization is inactive or suspended.")

        if not self.verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password.")

        # Generate JWT claims
        token_data = {
            "sub": user.id,
            "tenant_id": user.tenant_id,
            "role": user.role,
            "email": user.email
        }
        
        access_token = self.create_access_token(token_data)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "tenant_id": user.tenant_id
            },
            "tenant": {
                "id": tenant.id,
                "name": tenant.name,
                "domain": tenant.domain
            }
        }

    async def get_current_user_from_token(self, token: str) -> User:
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise AuthenticationError("Token is invalid.")
        except Exception:
            raise AuthenticationError("Could not validate credentials.")

        user = await self.user_repo.get_by_id(user_id)
        if not user or user.status != "active":
            raise AuthenticationError("User not found or suspended.")
        return user
