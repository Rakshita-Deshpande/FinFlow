from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    month = Column(String, nullable=False)

class Lending(Base):
    __tablename__ = "lending"

    id = Column(Integer, primary_key=True, index=True)
    person_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    date = Column(String, nullable=False)
    is_settled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())