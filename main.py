from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from database import engine
import models
from routers import transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(transactions.router)

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(request, "index.html")

@app.get("/transactions-page")
async def transactions_page(request: Request):
    return templates.TemplateResponse(request, "transactions.html")

@app.get("/health")
def health():
    return {"status": "FinFlow is running"}