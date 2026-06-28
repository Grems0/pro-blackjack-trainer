from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import logging
import stripe
from pathlib import Path
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ── Stripe ──────────────────────────────────────────────────────────────────
stripe.api_key        = os.environ.get('STRIPE_SECRET_KEY', '')
WEBHOOK_SECRET        = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
PRICE_MONTHLY         = os.environ.get('STRIPE_PRICE_MONTHLY', '')
PRICE_ANNUAL          = os.environ.get('STRIPE_PRICE_ANNUAL', '')
FRONTEND_URL          = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# ── MongoDB ──────────────────────────────────────────────────────────────────
MONGO_URL = os.environ.get('MONGO_URL', '')
DB_NAME   = os.environ.get('DB_NAME', 'blackjack')
_client   = AsyncIOMotorClient(MONGO_URL) if MONGO_URL else None
db        = _client[DB_NAME] if _client else None

# ── Auth ─────────────────────────────────────────────────────────────────────
JWT_SECRET    = os.environ.get('JWT_SECRET', 'change-me-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRE_DAYS = 90

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
bearer  = HTTPBearer(auto_error=False)

app        = FastAPI()
api_router = APIRouter(prefix='/api')

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_token(email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode({'sub': email, 'exp': exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    return payload['sub']

async def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=401, detail='Non authentifié')
    try:
        email = decode_token(creds.credentials)
    except JWTError:
        raise HTTPException(status_code=401, detail='Token invalide')
    if db is None:
        raise HTTPException(status_code=503, detail='Base de données indisponible')
    user = await db.users.find_one({'email': email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail='Utilisateur introuvable')
    return user


# ── Models ───────────────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    email:      EmailStr
    password:   str
    session_id: str  # Stripe checkout session ID — vérifié côté serveur

class LoginBody(BaseModel):
    email:    EmailStr
    password: str


# ── Auth routes ───────────────────────────────────────────────────────────────

@api_router.get('/verify-session')
async def verify_session(session_id: str):
    """Appeler depuis la page de succès Stripe — renvoie email + plan."""
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail='Stripe non configuré')
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if session.payment_status not in ('paid', 'no_payment_required'):
        raise HTTPException(status_code=402, detail='Paiement non confirmé')

    email = session.customer_details.email if session.customer_details else None
    if not email:
        raise HTTPException(status_code=400, detail='Email introuvable dans la session')

    # Déterminer le plan depuis le price ID
    line_items = stripe.checkout.Session.list_line_items(session_id, limit=1)
    price_id   = line_items.data[0].price.id if line_items.data else ''
    plan = 'annual' if price_id == PRICE_ANNUAL else 'monthly'

    return {'email': email, 'plan': plan, 'session_id': session_id}


@api_router.post('/register')
async def register(body: RegisterBody):
    if db is None:
        raise HTTPException(status_code=503, detail='Base de données indisponible')

    # Vérifier la session Stripe
    try:
        session = stripe.checkout.Session.retrieve(body.session_id)
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if session.payment_status not in ('paid', 'no_payment_required'):
        raise HTTPException(status_code=402, detail='Paiement non confirmé')

    stripe_email = (session.customer_details.email or '').lower()
    if stripe_email != body.email.lower():
        raise HTTPException(status_code=400, detail="L'email ne correspond pas au paiement Stripe")

    # Email déjà enregistré ?
    existing = await db.users.find_one({'email': body.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail='Compte déjà existant pour cet email')

    # Durée d'abonnement
    line_items = stripe.checkout.Session.list_line_items(body.session_id, limit=1)
    price_id   = line_items.data[0].price.id if line_items.data else ''
    plan       = 'annual' if price_id == PRICE_ANNUAL else 'monthly'
    days       = 365 if plan == 'annual' else 30
    expiry     = datetime.now(timezone.utc) + timedelta(days=days)

    hashed = pwd_ctx.hash(body.password)
    await db.users.insert_one({
        'email':        body.email.lower(),
        'password':     hashed,
        'plan':         plan,
        'subscribed_at': datetime.now(timezone.utc).isoformat(),
        'expiry_date':  expiry.isoformat(),
        'stripe_customer': session.customer,
        'stripe_session':  body.session_id,
    })

    token = make_token(body.email.lower())
    return {
        'token':      token,
        'email':      body.email.lower(),
        'plan':       plan,
        'expiry_date': expiry.isoformat(),
    }


@api_router.post('/login')
async def login(body: LoginBody):
    if db is None:
        raise HTTPException(status_code=503, detail='Base de données indisponible')

    user = await db.users.find_one({'email': body.email.lower()})
    if not user or not pwd_ctx.verify(body.password, user['password']):
        raise HTTPException(status_code=401, detail='Email ou mot de passe incorrect')

    # Vérifier expiration (renouvellement auto possible via webhook)
    expiry = datetime.fromisoformat(user['expiry_date'])
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    is_active = expiry > datetime.now(timezone.utc)

    token = make_token(user['email'])
    return {
        'token':      token,
        'email':      user['email'],
        'plan':       user.get('plan', ''),
        'expiry_date': user['expiry_date'],
        'is_active':  is_active,
    }


@api_router.get('/me')
async def me(user=Depends(current_user)):
    expiry = datetime.fromisoformat(user['expiry_date'])
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    return {
        'email':      user['email'],
        'plan':       user.get('plan', ''),
        'expiry_date': user['expiry_date'],
        'is_active':  expiry > datetime.now(timezone.utc),
    }


# ── Stripe Webhook ────────────────────────────────────────────────────────────

@api_router.post('/webhook')
async def stripe_webhook(request: Request):
    payload    = await request.body()
    sig_header = request.headers.get('stripe-signature', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    etype = event['type']

    if etype == 'customer.subscription.deleted':
        # Abonnement annulé — marquer expiré immédiatement
        sub         = event['data']['object']
        customer_id = sub['customer']
        if db is not None:
            cust = stripe.Customer.retrieve(customer_id)
            email = cust.email
            if email:
                await db.users.update_one(
                    {'email': email.lower()},
                    {'$set': {'expiry_date': datetime.now(timezone.utc).isoformat()}}
                )

    elif etype == 'invoice.payment_succeeded':
        # Renouvellement automatique — prolonger l'abonnement
        invoice     = event['data']['object']
        customer_id = invoice.get('customer')
        plan_id     = (invoice.get('lines', {}).get('data', [{}])[0]
                       .get('price', {}).get('id', ''))
        if customer_id and db is not None:
            cust  = stripe.Customer.retrieve(customer_id)
            email = cust.email
            if email:
                days   = 365 if plan_id == PRICE_ANNUAL else 30
                expiry = datetime.now(timezone.utc) + timedelta(days=days)
                await db.users.update_one(
                    {'email': email.lower()},
                    {'$set': {'expiry_date': expiry.isoformat()}}
                )

    return {'received': True}


# ── Health check ──────────────────────────────────────────────────────────────

@api_router.get('/')
async def root():
    return {'status': 'ok', 'service': 'Pro Blackjack Trainer API'}


# ── App setup ─────────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.on_event('shutdown')
async def shutdown():
    if _client:
        _client.close()
