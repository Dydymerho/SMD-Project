import os

class Settings:
    PROJECT_NAME = "SMD AI"
    TEMP_DIR = os.path.join(os.getcwd(), "app/services/temp_uploads") 

settings = Settings()
os.makedirs(settings.TEMP_DIR, exist_ok=True)