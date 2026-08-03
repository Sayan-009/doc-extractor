class BaseCustomError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class NotFoundError(BaseCustomError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, status_code=404)

class ValidationError(BaseCustomError):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message=message, status_code=422)
