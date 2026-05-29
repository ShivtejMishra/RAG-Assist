import uvicorn
import structlog
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.infrastructure.config.settings import settings
from app.infrastructure.web.routers import auth, document, chat
from app.domain.exceptions import DomainException, AuthenticationError, PermissionDeniedError

# Configure structured JSON logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# 1. Initialize FastAPI
app = FastAPI(
    title="RAGAssist Enterprise Knowledge Platform",
    description="Multi-tenant, secure document conversational AI platform using Google Gemini.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# 2. Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify explicit client domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register Domain Exception Handlers
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    logger.warn("domain_exception_triggered", message=exc.message)
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message}
    )

@app.exception_handler(AuthenticationError)
async def auth_exception_handler(request: Request, exc: AuthenticationError):
    logger.warn("auth_exception_triggered", message=exc.message)
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message}
    )

@app.exception_handler(PermissionDeniedError)
async def permission_exception_handler(request: Request, exc: PermissionDeniedError):
    logger.warn("permission_exception_triggered", message=exc.message)
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message}
    )

# 4. Mount API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(document.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")

@app.get("/healthz", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "engine": "FastAPI + Google Gemini API",
        "isolated_tenant_indexing": "active"
    }

if __name__ == "__main__":
    logger.info("starting_fastapi_server", host=settings.HOST, port=settings.PORT)
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
