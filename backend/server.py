from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import stripe
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Stripe
stripe.api_key            = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET     = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
STRIPE_PRICE_MONTHLY      = os.environ.get('STRIPE_PRICE_MONTHLY', '')
STRIPE_PRICE_ANNUAL       = os.environ.get('STRIPE_PRICE_ANNUAL', '')
FRONTEND_URL              = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# MongoDB
mongo_url = os.environ.get('MONGO_URL', '')
db_name   = os.environ.get('DB_NAME', 'blackjack')
client    = AsyncIOMotorClient(mongo_url) if mongo_url else None
db        = client[db_name] if client else None

app        = FastAPI()
api_router = APIRouter(prefix="/api")


# ─── Models ───────────────────────────────────────────────────────────────────

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id:          str      = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp:   datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class CheckoutRequest(BaseModel):
    plan: str  # 'monthly' | 'annual'


# ─── Status routes ────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Pro Blackjack Trainer API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj  = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    if db is not None:
        await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if db is None:
        return []
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ─── Stripe — Checkout Session ────────────────────────────────────────────────

@api_router.post("/create-checkout-session")
async def create_checkout_session(body: CheckoutRequest):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe non configuré.")

    price_id = STRIPE_PRICE_ANNUAL if body.plan == 'annual' else STRIPE_PRICE_MONTHLY
    if not price_id:
        raise HTTPException(status_code=500, detail="Price ID Stripe manquant.")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/payment/cancel",
            allow_promotion_codes=True,
            billing_address_collection="auto",
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─── Stripe — Webhook ─────────────────────────────────────────────────────────

@api_router.post("/webhook")
async def stripe_webhook(request: Request):
    payload    = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        sub         = event["data"]["object"]
        customer_id = sub["customer"]
        plan_id     = sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id", "")
        if db is not None:
            await db.subscriptions.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {
                    "stripe_customer_id":  customer_id,
                    "subscription_status": sub["status"],
                    "plan":                plan_id,
                    "updated_at":          datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True,
            )

    elif event["type"] == "customer.subscription.deleted":
        sub         = event["data"]["object"]
        customer_id = sub["customer"]
        if db is not None:
            await db.subscriptions.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"subscription_status": "canceled", "updated_at": datetime.now(timezone.utc).isoformat()}},
            )

    elif event["type"] == "checkout.session.completed":
        session     = event["data"]["object"]
        customer_id = session.get("customer")
        email       = session.get("customer_details", {}).get("email")
        if db is not None and customer_id and email:
            await db.subscriptions.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"email": email}},
                upsert=True,
            )

    return {"received": True}


# ─── Vérifier statut abonnement ───────────────────────────────────────────────

@api_router.get("/subscription-status")
async def get_subscription_status(email: str):
    if db is None:
        return {"active": False}
    sub = await db.subscriptions.find_one({"email": email}, {"_id": 0})
    if not sub:
        return {"active": False}
    return {
        "active": sub.get("subscription_status") == "active",
        "plan":   sub.get("plan", ""),
        "status": sub.get("subscription_status", ""),
    }


# ─── App setup ────────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
