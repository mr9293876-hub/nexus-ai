import base64
import hashlib
from cryptography.fernet import Fernet
from .config import get_settings


def _fernet() -> Fernet:
    configured = get_settings().encryption_key
    raw = configured.encode() if configured else hashlib.sha256(get_settings().jwt_secret.encode()).digest()
    key = base64.urlsafe_b64encode(raw)
    return Fernet(key)


def encrypt(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()
