import pytest
from app.use_cases.auth.auth_use_cases import AuthUseCases
from app.domain.exceptions import AuthenticationError, RegistrationError

@pytest.mark.asyncio
async def test_tenant_registration_and_login(user_repo, tenant_repo):
    auth_service = AuthUseCases(
        user_repo=user_repo,
        tenant_repo=tenant_repo,
        jwt_secret="test-secret-key-12345",
        jwt_algorithm="HS256"
    )

    # 1. Register a new tenant and admin user
    reg_result = await auth_service.register_tenant_and_admin(
        tenant_name="Acme Inc",
        domain="acme.com",
        admin_email="admin@acme.com",
        admin_password="securepassword",
        admin_name="Admin User"
    )

    assert reg_result["tenant"].name == "Acme Inc"
    assert reg_result["tenant"].domain == "acme.com"
    assert reg_result["user"].email == "admin@acme.com"
    assert auth_service.verify_password("securepassword", reg_result["user"].hashed_password)

    # 2. Prevent duplicate registrations for same domain
    with pytest.raises(RegistrationError):
        await auth_service.register_tenant_and_admin(
            tenant_name="Acme Copy",
            domain="acme.com",
            admin_email="other@acme.com",
            admin_password="password",
            admin_name="Other User"
        )

    # 3. Successful login
    login_result = await auth_service.login_user(
        email="admin@acme.com",
        password="securepassword"
    )

    assert login_result["access_token"] is not None
    assert login_result["user"]["email"] == "admin@acme.com"
    assert login_result["tenant"]["name"] == "Acme Inc"

    # 4. Failed login with wrong password
    with pytest.raises(AuthenticationError):
        await auth_service.login_user(
            email="admin@acme.com",
            password="wrongpassword"
        )
