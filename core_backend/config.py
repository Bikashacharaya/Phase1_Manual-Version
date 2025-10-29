import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/equipment_lending_db")
    JWT_ALGORITHM = "HS256"
    JWT_EXP_DELTA_SECONDS = 60 * 60 * 24  # 1 day
