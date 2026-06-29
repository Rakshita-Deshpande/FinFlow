from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to FinFlow!"}

@app.get("/health")
def health():
    return {"status": "FinFlow is running"}