from pydantic import BaseModel, Field, field_serializer
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, Literal


TransactionType = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: Decimal = Field(gt=0, decimal_places=2)
    category: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    date: date


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    date: Optional[date] = None


class TransactionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    created_at: datetime
    user_id: str
    type: TransactionType
    amount: float
    category: str
    description: Optional[str]
    date: date
