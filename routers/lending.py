from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Lending
from pydantic import BaseModel

router = APIRouter()

class LendingCreate(BaseModel):
    person_name: str
    amount: float
    reason: str
    date: str

@router.get("/lending")
def get_lending(db: Session = Depends(get_db)):
    return db.query(Lending).all()

@router.post("/lending")
def create_lending(lending: LendingCreate, db: Session = Depends(get_db)):
    db_lending = Lending(**lending.dict())
    db.add(db_lending)
    db.commit()
    db.refresh(db_lending)
    return db_lending

@router.put("/lending/{lending_id}/settle")
def settle_lending(lending_id: int, db: Session = Depends(get_db)):
    lending = db.query(Lending).filter(Lending.id == lending_id).first()
    if not lending:
        raise HTTPException(status_code=404, detail="Lending not found")
    lending.is_settled = True
    db.commit()
    return {"message": "Marked as settled"}

@router.delete("/lending/{lending_id}")
def delete_lending(lending_id: int, db: Session = Depends(get_db)):
    lending = db.query(Lending).filter(Lending.id == lending_id).first()
    if not lending:
        raise HTTPException(status_code=404, detail="Lending not found")
    db.delete(lending)
    db.commit()
    return {"message": "Lending deleted"}