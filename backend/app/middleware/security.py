from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


def validate_image_magic_bytes(content: bytes) -> bool:
    """
    Validates binary header magic bytes to ensure file is an authentic image (JPEG, PNG, WebP).
    Prevents disguised executables, scripts, or polyglot files.
    """
    if len(content) < 12:
        return False

    # JPEG: starts with FF D8 FF
    if content.startswith(b"\xff\xd8\xff"):
        return True

    # PNG: starts with 89 50 4E 47 0D 0A 1A 0A
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return True

    # WebP: starts with RIFF and has WEBP at offset 8
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return True

    return False
