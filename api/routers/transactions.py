import calendar
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.transaction import Transaction
from schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from auth.deps import get_current_user_id

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    q = db.query(Transaction).filter(Transaction.user_id == user_id)

    if month:
        year, m = map(int, month.split("-"))
        last_day = calendar.monthrange(year, m)[1]
        q = q.filter(
            Transaction.date >= date(year, m, 1),
            Transaction.date <= date(year, m, last_day),
        )

    return q.order_by(Transaction.date.desc()).all()


@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(
    body: TransactionCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    tx = Transaction(**body.model_dump(), user_id=user_id)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: str,
    body: TransactionUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id, Transaction.user_id == user_id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=204)
def delete_transaction(
    tx_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id, Transaction.user_id == user_id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
