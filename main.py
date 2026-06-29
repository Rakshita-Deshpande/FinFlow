from fastapi import FastAPI
from database import engine
import models
from routers import transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(transactions.router)

@app.get("/")
def home():
    return {"message": "Welcome to FinFlow!"}

@app.get("/health")
def health():
    return {"status": "FinFlow is running"}