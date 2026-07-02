from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Budget, Transaction
from pydantic import BaseModel

router = APIRouter()

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str

@router.get("/budgets")
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).all()
    result = []
    for budget in budgets:
        spent = db.query(Transaction).filter(
            Transaction.category == budget.category,
            Transaction.type == "expense",
            Transaction.date.like(f"{budget.month}%")
        ).all()
        total_spent = sum(tx.amount for tx in spent)
        result.append({
            "id": budget.id,
            "category": budget.category,
            "amount": budget.amount,
            "month": budget.month,
            "spent": total_spent,
            "remaining": budget.amount - total_spent,
            "percentage": round((total_spent / budget.amount) * 100) if budget.amount > 0 else 0
        })
    return result

@router.post("/budgets")
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    db_budget = Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}