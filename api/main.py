import models  # register all ORM models with Base.metadata before create_all
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from routers import auth, transactions

# Auto-create tables in local dev; production uses Alembic migrations
if settings.auth_mode == "local":
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="Family Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)


@app.get("/health")
def health():
    return {"status": "ok"}
