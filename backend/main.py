import sys
from pathlib import Path

# Ensure backend directory is first in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Project root (parent directory)
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

# Import top-level FastAPI application
from app.main import app

# Explicit export for Vercel and ASGI servers
__all__ = ["app"]
