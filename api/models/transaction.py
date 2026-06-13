import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Numeric, Text, CheckConstraint, Index
from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    # user_id is a UUID string; FK enforced at app level, not DB, to stay portable
    user_id = Column(String(36), nullable=False, index=True)
    type = Column(String(10), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)

    __table_args__ = (
        CheckConstraint("type IN ('income', 'expense')", name="ck_transaction_type"),
        CheckConstraint("amount > 0", name="ck_transaction_amount"),
        Index("ix_transactions_date", "date"),
        Index("ix_transactions_type", "type"),
    )
