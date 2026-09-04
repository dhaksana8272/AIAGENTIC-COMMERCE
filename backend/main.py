# import os
# from dotenv import load_dotenv
# load_dotenv()

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from db.database import Base, engine
# from db import models  # noqa: F401 -- ensures models are registered before create_all
# from catalog import routes as catalog_routes
# from routers import chat, checkout, audit, webhook, orders, auth

# app = FastAPI(title="Agent Storefront API", version="1.0.0")

# FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[FRONTEND_ORIGIN],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.on_event("startup")
# def on_startup():
#     # Creates tables if they don't already exist (safe alongside schema.sql).
#     Base.metadata.create_all(bind=engine)


# @app.get("/health")
# def health():
#     return {"status": "ok"}


# app.include_router(catalog_routes.router)
# app.include_router(chat.router)
# app.include_router(checkout.router)
# app.include_router(audit.router)
# app.include_router(webhook.router)
# app.include_router(orders.router)
# app.include_router(auth.router)



import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import Base, engine
from db import models  # noqa: F401 -- ensures models are registered before create_all
from catalog import routes as catalog_routes
from routers import chat, checkout, audit, webhook, orders, auth, merchant

app = FastAPI(title="Agent Storefront API", version="1.0.0")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates tables if they don't already exist (safe alongside schema.sql).
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(catalog_routes.router)
app.include_router(chat.router)
app.include_router(checkout.router)
app.include_router(audit.router)
app.include_router(webhook.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(merchant.router)