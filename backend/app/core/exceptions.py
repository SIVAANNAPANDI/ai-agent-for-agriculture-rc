from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger("agriassist")


class AgriAssistException(Exception):
    def __init__(self, message: str, code: str = "BAD_REQUEST", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundException(AgriAssistException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, code="NOT_FOUND", status_code=404)


class UnauthorizedException(AgriAssistException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401)


class ForbiddenException(AgriAssistException):
    def __init__(self, message: str = "Access forbidden. Ownership verification failed."):
        super().__init__(message=message, code="FORBIDDEN", status_code=403)


class BadRequestException(AgriAssistException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(message=message, code="BAD_REQUEST", status_code=400)


async def agriassist_exception_handler(request: Request, exc: AgriAssistException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        errors.append(f"{field}: {err['msg']}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "; ".join(errors) or "Invalid input data"
            }
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing your request. Please try again."
            }
        }
    )
