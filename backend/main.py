# backend/main.py (VERSION PROPRE - 5 SEPT 2025)
# ===============================================================
# SECTION 1 : IMPORTS
# Tous vos imports, une seule fois.
# ===============================================================
import os
import uuid
import random
import json
import shutil
import secrets
import asyncio
import base64
import io
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import List, Optional, Dict
from urllib.parse import urlencode

import uvicorn
from dotenv import load_dotenv
from fastapi import (
    Depends, FastAPI, HTTPException, BackgroundTasks, Request,
    WebSocket, status, File, UploadFile
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime,
    ForeignKey, Text, Boolean
)
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from starlette.middleware.sessions import SessionMiddleware
from starlette.websockets import WebSocketDisconnect
from authlib.integrations.starlette_client import OAuth
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from geoip2.database import Reader
import httpx
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, PlainTextResponse, RedirectResponse
import stripe
from fastapi import Response, status
import requests
import time
import random
import configparser

# ===============================================================
# SECTION 2 : CONFIGURATION GLOBALE
# Définition des constantes, chargement de .env, etc.
# ===============================================================
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fedids_main.db")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-dev-key")
ALGORITHM = "HS256"
GEOIP_DB_PATH = os.getenv("GEOIP_DB_PATH", "geoip_db/GeoLite2-City.mmdb")
PREMIUM_PLAN_PRICE = int(os.getenv("PREMIUM_PLAN_PRICE", "200"))
FRONTEND_BASE = os.getenv("FRONTEND_BASE", "http://localhost:5173")

# Email / Stripe configuration
mail_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False
)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# GeoIP reader (optional)
try:
    geoip_reader = Reader(GEOIP_DB_PATH)
except Exception:
    geoip_reader = None

# ===============================================================
# SECTION 3 : SETUP DE LA BASE DE DONNÉES
# ===============================================================
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ===============================================================
# SECTION 4 : MODÈLES SQLAlchemy
# Toutes vos classes qui héritent de `Base` (User, Device, AttackLog, etc.)
# ===============================================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    subscription_valid_until = Column(DateTime, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    devices = relationship("Device", back_populates="owner", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    api_key = Column(String, unique=True, default=lambda: uuid.uuid4().hex)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="devices")
    prevention_enabled = Column(Boolean, default=False)
    registration_token = Column(String, unique=True, nullable=True)


class DeviceStatus(Base):
    __tablename__ = "device_status"
    id = Column(Integer, primary_key=True)
    device_api_key = Column(String, ForeignKey("devices.api_key"), unique=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="offline")


class AttackLog(Base):
    __tablename__ = "attack_logs"
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source_ip = Column(String)
    attack_type = Column(String)
    confidence = Column(Float)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    flower_id = Column(String, unique=True)
    name = Column(String)
    status = Column(String, default="active")
    notes = Column(Text, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    history_records = relationship("ClientHistory", back_populates="client", cascade="all, delete-orphan")


class ClientHistory(Base):
    __tablename__ = "client_history"
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    server_round = Column(Integer)
    accuracy = Column(Float)
    loss = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    client = relationship("Client", back_populates="history_records")


# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===============================================================
# SECTION 5 : MODÈLES Pydantic
# Toutes vos classes qui héritent de `BaseModel` (UserPublic, Token, etc.)
# ===============================================================
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    username: str
    role: str
    subscription_valid_until: Optional[datetime] = None
    profile_picture_url: Optional[str] = None
    full_name: Optional[str] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    company: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic


class DeviceCreate(BaseModel):
    name: str


class DevicePublic(BaseModel):
    id: int
    name: str
    api_key: str
    prevention_enabled: bool
    registration_token: Optional[str] = None

    class Config:
        from_attributes = True


class DeviceStatusPublic(BaseModel):
    last_seen: Optional[datetime]
    status: str

    class Config:
        from_attributes = True


class DeviceWithStatus(DevicePublic):
    status_info: Optional[DeviceStatusPublic] = None


class VerificationData(BaseModel):
    email: EmailStr
    code: str


class HeartbeatPayload(BaseModel):
    api_key: str


class DashboardStats(BaseModel):
    device_count: int
    attacks_this_week: int
    last_attack_timestamp: Optional[datetime] = None


class FLClientRegistration(BaseModel):
    api_key: str
    flower_cid: str


class AttackReport(BaseModel):
    source_ip: str
    attack_type: str
    confidence: float


class ClientModel(BaseModel):
    id: int
    flower_id: str
    name: str
    status: str
    notes: Optional[str]
    registered_at: datetime

    class Config:
        from_attributes = True


class HistoryModel(BaseModel):
    server_round: int
    accuracy: float
    loss: float
    timestamp: datetime

    class Config:
        from_attributes = True


class AttackLogPublic(BaseModel):
    id: int
    timestamp: datetime
    source_ip: str
    attack_type: str
    confidence: float
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True

class FLStatus(BaseModel): server_round: int; accuracy: float
class ClientHistoryPayload(BaseModel):
    client_flower_id: str; server_round: int; accuracy: float; loss: float

# ===============================================================
# SECTION 6 : HELPERS (Sécurité, Auth, et autres)
# ===============================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth = OAuth()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=1)
    payload = {**data, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    exc = HTTPException(status_code=401, detail="Invalid token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise exc
    except JWTError:
        raise exc
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise exc
    return user


async def get_current_admin_user(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return user


def enrich_geoip(ip: str):
    if not geoip_reader:
        return None, None, None, None
    try:
        response = geoip_reader.city(ip)
        lat = response.location.latitude
        lon = response.location.longitude
        city = response.city.name
        country = response.country.name
        return lat, lon, city, country
    except Exception:
        return None, None, None, None


async def send_ntfy_notification(attack: AttackLog):
    try:
        message = f"🚨 {attack.attack_type} from {attack.source_ip} ({attack.country or 'Unknown'})"
        async with httpx.AsyncClient() as client:
            await client.post(
                os.getenv("NTFY_TOPIC_URL", "https://ntfy.sh/ok"),
                data=message.encode("utf-8"),
                headers={"Title": "FedIDS Alert", "Priority": "high"}
            )
    except Exception as e:
        print("❌ Ntfy error:", e)


def log_to_json_serializable(log_entry: AttackLog) -> Dict:
    return {
        "id": log_entry.id,
        "timestamp": log_entry.timestamp.isoformat(),
        "source_ip": log_entry.source_ip,
        "attack_type": log_entry.attack_type,
        "confidence": log_entry.confidence,
        "latitude": log_entry.latitude,
        "longitude": log_entry.longitude,
        "city": log_entry.city,
        "country": log_entry.country,
    }

# ===============================================================
# SECTION 7 : LIFESPAN & INSTANCE DE L'APP
# Une seule fois !
# ===============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    oauth.register(
        name="google",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    Base.metadata.create_all(bind=engine)
    # Créer un admin par défaut si nécessaire
    with SessionLocal() as db:
        if not db.query(User).filter_by(username="yasmine").first():
            admin = User(
                email="yasmine@fedids.io",
                username="yasmine",
                hashed_password=get_password_hash("yasmine"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    yield


app = FastAPI(title="FedIds API", lifespan=lifespan)

# ===============================================================
# SECTION 8 : MIDDLEWARES & FICHIERS STATIQUES
# Une seule fois !
# ===============================================================
os.makedirs("static/profile_pics", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.channels: Dict[str, List[WebSocket]] = {"attacks": [], "fl_status": []}

    async def connect(self, ws: WebSocket, channel: str):
        await ws.accept()
        self.channels.setdefault(channel, []).append(ws)

    def disconnect(self, ws: WebSocket, channel: str):
        if ws in self.channels.get(channel, []):
            self.channels[channel].remove(ws)

    async def broadcast(self, msg: str, ch: str):
        await asyncio.gather(*(c.send_text(msg) for c in self.channels.get(ch, [])), return_exceptions=True)


manager = ConnectionManager()

# ===============================================================
# SECTION 9 : API ENDPOINTS
# Toutes vos fonctions de route `@app.get(...)`, `@app.post(...)`, etc.
# ===============================================================

# ------------------ AUTH ------------------
@app.post("/api/auth/register", response_model=UserPublic)
async def register(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first():
        raise HTTPException(status_code=400, detail="Email or username already used")
    code = f"{random.randint(100000,999999)}"
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        verification_code=code,
        is_active=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    fm = FastMail(mail_conf)
    msg = MessageSchema(
        subject="FedIds - Activate Your Account",
        recipients=[user.email],
        body=f"<p>Your verification code is <b>{code}</b></p>",
        subtype="html",
    )
    background_tasks.add_task(fm.send_message, msg)
    return UserPublic.model_validate(user)


@app.post("/api/auth/verify")
def verify_email(data: VerificationData, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_active:
        return {"message": "Already activated"}
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid code")
    user.is_active = True
    user.verification_code = None
    db.commit()
    return {"message": "Account activated"}


@app.post("/api/auth/login", response_model=Token)
def login(db: Session = Depends(get_db), f: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.username == f.username).first()
    if not user or not user.hashed_password or not verify_password(f.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, token_type="bearer", user=UserPublic.model_validate(user))


@app.get("/api/users/me", response_model=UserPublic)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/users/me/profile", response_model=UserPublic)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/users/me/upload-picture", response_model=UserPublic)
async def upload_profile_picture(
    file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{user.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join("static", "profile_pics", filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    user.profile_picture_url = f"/static/profile_pics/{filename}"
    db.commit()
    db.refresh(user)
    return user


@app.get("/profile-pic/{filename}")
async def get_profile_pic(filename: str):
    file_path = os.path.join("static", "profile_pics", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Profile picture not found")
    return {"url": f"/static/profile_pics/{filename}"}
@app.post("/api/users/me/upgrade-to-premium", response_model=UserPublic)
def upgrade_user_to_premium(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Simule un paiement et met à jour le rôle de l'utilisateur en 'premium' avec une date de validité.
    """
    # On travaille sur l'instance de l'utilisateur actuel
    user = current_user
    
    if user.role != "premium":
        user.role = "premium"
    
    # On définit (ou réinitialise) la date d'expiration à 30 jours à partir de maintenant
    user.subscription_valid_until = datetime.utcnow() + timedelta(days=90) # 3 MOIS
    
    db.commit()
    db.refresh(user)
    print(f"User '{user.username}' is now PREMIUM. Valid until: {user.subscription_valid_until}")
    
    return UserPublic.model_validate(user)

# ------------------ DEVICES ------------------
@app.post("/api/devices/register", response_model=DevicePublic)
def register_device(device_in: DeviceCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_device = Device(name=device_in.name, owner_id=user.id, registration_token=secrets.token_hex(16))
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device


@app.get("/api/devices/install/{reg_token}", response_class=PlainTextResponse)
def get_install_script(reg_token: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.registration_token == reg_token).first()
    if not device:
        return "echo '❌ Error: Invalid or expired registration token.'; exit 1"

    api_key = device.api_key
    device.registration_token = None
    db.commit()

    github_client_repo_url = "https://github.com/yasminegh01/fedids-iiot-client.git"

    # === LE NOUVEAU SCRIPT "EN LIGNE" ===
    script_content = f"""#!/bin/bash
set -e # Arrêter le script si une commande échoue

echo "--- FedIds IIoT Online Installer ---"

# 1. Installer les dépendances système (Python 3.11, git, etc.)
echo "➡️ Step 1/4: Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y git python3.11 python3.11-venv libasound2-dev

# 2. Cloner le code source du client
echo "➡️ Step 2/4: Downloading client source code..."
git clone {github_client_repo_url} iiot_client
cd iiot_client

# 3. Créer l'environnement virtuel et installer les paquets (en ligne)
echo "➡️ Step 3/4: Creating venv and installing packages (this will take time)..."
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configurer l'appareil
echo "➡️ Step 4/4: Configuring device..."
echo "[device]" > config.ini
echo "api_key = {api_key}" >> config.ini

echo ""
echo "🚀 Installation Complete!"
echo "To start the client, navigate to the 'iiot_client' directory and run:"
echo "   source venv/bin/activate"
echo "   python client.py --client-id 0 --config config.ini --server-ip <YOUR_SERVER_IP>"
"""
    return script_content


@app.get("/api/devices/my-devices-with-status", response_model=List[DeviceWithStatus])
def get_my_devices_with_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    five_min = datetime.utcnow() - timedelta(minutes=5)
    db.query(DeviceStatus).filter(DeviceStatus.last_seen < five_min).update({"status": "offline"}, synchronize_session=False)
    db.commit()
    response = []
    for d in user.devices:
        status_obj = db.query(DeviceStatus).filter_by(device_api_key=d.api_key).first()
        response.append(
            DeviceWithStatus(**DevicePublic.model_validate(d).model_dump(), status_info=DeviceStatusPublic.model_validate(status_obj) if status_obj else None)
        )
    return response


@app.post("/api/devices/heartbeat")
def device_heartbeat(payload: HeartbeatPayload, db: Session = Depends(get_db)):
    d = db.query(Device).filter_by(api_key=payload.api_key).first()
    if not d:
        raise HTTPException(status_code=404, detail="Device not found")
    status_obj = db.query(DeviceStatus).filter_by(device_api_key=d.api_key).first()
    if status_obj:
        status_obj.last_seen = datetime.utcnow()
        status_obj.status = "online"
    else:
        db.add(DeviceStatus(device_api_key=d.api_key, status="online", last_seen=datetime.utcnow()))
    db.commit()
    return {"status": "ok"}


@app.get("/api/devices/{api_key}/settings")
def get_device_settings(api_key: str, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.api_key == api_key).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"prevention_enabled": device.prevention_enabled}


@app.post("/api/devices/{device_id}/toggle-prevention", response_model=DevicePublic)
def toggle_prevention(device_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "premium":
        raise HTTPException(status_code=403, detail="This is a premium feature.")
    device = db.query(Device).filter(Device.id == device_id, Device.owner_id == user.id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found or not owned by user.")
    device.prevention_enabled = not device.prevention_enabled
    db.commit()
    db.refresh(device)
    return device
@app.delete("/api/devices/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    device_to_delete = db.query(Device).filter(
        Device.id == device_id,
        Device.owner_id == current_user.id
    ).first()

    if not device_to_delete:
        raise HTTPException(status_code=404, detail="Device not found.")

    db.delete(device_to_delete)
    db.commit()
    
    # Cette ligne a besoin de `Response` et `status` pour fonctionner
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ------------------ DASHBOARD / ATTACKS ------------------
@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_user_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    attacks = db.query(AttackLog).filter(AttackLog.timestamp >= seven_days_ago).count()
    last = db.query(AttackLog).order_by(AttackLog.timestamp.desc()).first()
    return DashboardStats(device_count=len(current_user.devices), attacks_this_week=attacks, last_attack_timestamp=last.timestamp if last else None)


@app.get("/api/attacks/history", response_model=List[AttackLogPublic])
def get_attack_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(AttackLog).order_by(AttackLog.timestamp.desc()).limit(50).all()


@app.post("/api/attacks/report", response_model=AttackLogPublic)
async def report_attack(report: AttackReport, db: Session = Depends(get_db)):
    lat, lon, city, country = enrich_geoip(report.source_ip)
    new_log = AttackLog(
        source_ip=report.source_ip,
        attack_type=report.attack_type,
        confidence=report.confidence,
        latitude=lat,
        longitude=lon,
        city=city,
        country=country,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    await manager.broadcast(json.dumps(log_to_json_serializable(new_log)), "attacks")
    await send_ntfy_notification(new_log)
    return new_log

@app.post("/api/fl_update")
async def fl_update(status: FLStatus):
    """
    Reçoit une mise à jour du serveur Flower (accuracy globale) et la diffuse
    aux clients WebSocket connectés sur le canal 'fl_status'.
    """
    print(f"Received FL update: Round {status.server_round}, Accuracy {status.accuracy:.4f}")
    await manager.broadcast(status.model_dump_json(), "fl_status")
    return {"status": "broadcasted"}


# ------------------ ADMIN ------------------
@app.get("/api/admin/dashboard", response_model=DashboardStats)
def get_dashboard(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    count = db.query(Device).count()
    attacks = db.query(AttackLog).filter(AttackLog.timestamp > datetime.utcnow() - timedelta(days=7)).count()
    last = db.query(AttackLog).order_by(AttackLog.timestamp.desc()).first()
    return DashboardStats(device_count=count, attacks_this_week=attacks, last_attack_timestamp=last.timestamp if last else None)


@app.get("/api/admin/clients", response_model=List[ClientModel], dependencies=[Depends(get_current_admin_user)])
def get_admin_clients(db: Session = Depends(get_db)):
    return db.query(Client).order_by(Client.registered_at.desc()).all()


@app.get("/api/admin/attacks/history", response_model=List[AttackLogPublic], dependencies=[Depends(get_current_admin_user)])
def get_global_attack_history(db: Session = Depends(get_db)):
    return db.query(AttackLog).order_by(AttackLog.timestamp.desc()).limit(200).all()


@app.post("/api/admin/client_history")
def save_client_history(
    history_payload: List[ClientHistoryPayload], 
    db: Session = Depends(get_db)
    # On pourrait ajouter `Depends(get_current_admin_user)` si on voulait le protéger,
    # mais pour une communication serveur-à-serveur, on peut le laisser ouvert sur le réseau local.
):
    """
    Reçoit l'historique de performance des clients à la fin d'un round
    et le sauvegarde dans la base de données.
    """
    for record in history_payload:
        # 1. Trouver le client par son ID Flower
        client = db.query(Client).filter(Client.flower_id == record.client_flower_id).first()
        
        # 2. S'il n'existe pas, le créer (cas du premier round)
        if not client:
            client = Client(flower_id=record.client_flower_id, name=f"Client_{record.client_flower_id[:6]}")
            db.add(client)
            db.commit()
            db.refresh(client)
            
        # 3. Créer l'entrée d'historique et la lier au client
        history_entry = ClientHistory(
            client_id=client.id,
            server_round=record.server_round,
            accuracy=record.accuracy,
            loss=record.loss
        )
        db.add(history_entry)
    
    db.commit()
    print(f"Saved history for {len(history_payload)} clients.")
    return {"status": "history saved"}
# ------------------ FLOWER ------------------
@app.post("/api/fl/register")
def fl_register(payload: FLClientRegistration, db: Session = Depends(get_db)):
    device = db.query(Device).filter_by(api_key=payload.api_key).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    # Liaison simple : stocker flower_cid dans owner.google_id
    if device.owner:
        device.owner.google_id = payload.flower_cid
        db.commit()
    return {"status": "registered"}


# ------------------ WEBSOCKETS ------------------
async def get_user_from_ws_token(websocket: WebSocket, db: Session = Depends(get_db)) -> Optional[User]:
    try:
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None
        return await get_current_user(token, db)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None


@app.websocket("/ws/attacks")
async def websocket_attacks(websocket: WebSocket, db: Session = Depends(get_db)):
    user = await get_user_from_ws_token(websocket, db)
    if not user:
        return
    await manager.connect(websocket, "attacks")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "attacks")


@app.websocket("/ws/fl_status")
async def websocket_fl_status(websocket: WebSocket, db: Session = Depends(get_db)):
    user = await get_user_from_ws_token(websocket, db)
    if not user:
        return
    await manager.connect(websocket, "fl_status")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "fl_status")


# ------------------ GOOGLE OAUTH ------------------
@app.get("/api/auth/google", include_in_schema=False)
async def login_via_google(request: Request):
    redirect_uri = request.url_for("auth_via_google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/api/auth/google/callback", include_in_schema=False)
async def auth_via_google_callback(request: Request, db: Session = Depends(get_db)):
    frontend_login_url = f"{FRONTEND_BASE}/login"
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        print(f"Error authorizing Google token: {e}")
        return RedirectResponse(url=f"{frontend_login_url}?error=google_auth_failed")

    user_info = token.get("userinfo") or token.get("id_token_claims")
    if not user_info or not user_info.get("sub") or not user_info.get("email"):
        return RedirectResponse(url=f"{frontend_login_url}?error=google_info_missing")

    google_id = user_info["sub"]
    email = user_info["email"]

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            user.is_active = True
        else:
            base_username = email.split("@")[0].replace('.', '_')
            final_username = base_username
            while db.query(User).filter(User.username == final_username).first():
                final_username = f"{base_username}_{uuid.uuid4().hex[:4]}"
            user = User(email=email, google_id=google_id, username=final_username, is_active=True, role="user")
            db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.username})
    frontend_callback_url = f"{FRONTEND_BASE}/auth/callback"
    user_data_for_frontend = UserPublic.model_validate(user).model_dump_json()
    params = urlencode({"token": access_token, "user": user_data_for_frontend})
    return RedirectResponse(url=f"{frontend_callback_url}?{params}")


# ------------------ PAYMENTS / STRIPE ------------------
@app.post("/api/payments/create-payment-intent")
def create_payment(user: User = Depends(get_current_user)):
    try:
        intent = stripe.PaymentIntent.create(
            amount=PREMIUM_PLAN_PRICE,
            currency='eur',
            automatic_payment_methods={'enabled': True},
            metadata={'user_id': user.id}
        )
        return {'clientSecret': intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {e}")

    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        user_id = intent['metadata'].get('user_id')
        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user and user.role != 'premium':
                user.role = 'premium'
                user.subscription_valid_until = datetime.utcnow() + timedelta(days=30)
                db.commit()
                print(f"✅ Webhook SUCCESS: User {user.username} upgraded to PREMIUM.")

    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        user_id = intent['metadata'].get('user_id')
        print(f"❌ Webhook FAILED: Payment failed for user ID {user_id}.")

    return {"status": "success"}


# ===============================================================
# SECTION 10 : LANCEUR UVICORN
# Tout à la fin du fichier.
# ===============================================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv('PORT', 8000)), reload=True)
