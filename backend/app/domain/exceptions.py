class DomainException(Exception):
    """Base exception for all domain logic related errors."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

class EntityNotFoundError(DomainException):
    """Raised when a requested entity does not exist."""
    pass

class AuthenticationError(DomainException):
    """Raised when authentication credentials fail validation."""
    pass

class RegistrationError(DomainException):
    """Raised when user registration fails due to duplicate email, etc."""
    pass

class PermissionDeniedError(DomainException):
    """Raised when a user attempts an action outside their role privileges."""
    pass

class TenantSuspendedError(DomainException):
    """Raised when accessing a resource belonging to a suspended tenant."""
    pass

class IngestionError(DomainException):
    """Raised when document ingestion or vectorization fails."""
    pass
