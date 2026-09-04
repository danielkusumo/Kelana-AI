from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db, SessionLocal
from models.trip import Trip
from services.trip_service import (get_trip_category, calculate_daily_budget, get_transport, get_recommendations)
from services.bedrock_service import get_ai_recommendation, ask_base_model
from services.auth_service import register, login, get_user_id
from services.kb_service import ask_knowledge_base
from services.conversation_service import (create_conversation, list_conversations, get_conversation, send_message, update_conversation, delete_conversation)

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class QuestionRequest(BaseModel):
    question: str

class MessageRequest(BaseModel):
    content: str

class ConversationUpdateRequest(BaseModel):
    title: str

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://kelana-ai-xi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def home():
    return {"message" : "Welcome to KelanaAI"}

@app.get("/health")
def status_check():
    return {"status" : "OK"}

@app.post("/api/v1/trips/{id}/generate")
def create_trip(req: TripRequest, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    daily_budget = calculate_daily_budget(req.budget, req.days)
    category = get_trip_category(req.budget)
    recommended_transport = get_transport(category)
    ai_recommendation = get_ai_recommendation(
        destination=req.destination,
        days=req.days,
        budget=req.budget,
        travel_style=req.travel_style
    )

    # create a trip ORM objects
    trip = Trip (
        user_id = user_id,
        destination = req.destination,
        days = req.days,
        budget = req.budget,
        travel_style = req.travel_style,
        daily_budget = daily_budget,
        category = category,
        recommended_transport = recommended_transport,
        ai_recommendation = ai_recommendation,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip) # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips(authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this trip")
        return trip
    finally:
        db.close()

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    if trip.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")

    try:
        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} has been successfully deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete trip: {str(e)}")
    finally:
        db.close()

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, req: TripRequest, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this trip")

        trip.destination = req.destination
        trip.days = req.days
        trip.budget = req.budget
        trip.travel_style = req.travel_style
        trip.daily_budget = calculate_daily_budget(req.budget, req.days)
        trip.category = get_trip_category(req.budget)
        trip.recommended_transport = get_transport(trip.category)

        db.commit()
        db.refresh(trip)

        return trip
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update trip: {str(e)}")
    finally:
        db.close()

@app.get("/api/v1/trip-categories")
def list_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]

@app.get("/api/v1/recommendations")
def recommendations(destination: str):
    return get_recommendations(destination)

@app.get("/api/v1/transportations")
def transport():
    return ["Bus", "Train", "Flight"]

@app.post("/api/v1/auth/register")
def register_user(req: RegisterRequest):
    return register(name=req.name, email=req.email, password=req.password)

@app.post("/api/v1/auth/login")
def login_user(req: LoginRequest):
    return login(email=req.email, password=req.password)

@app.post("/api/v1/ask")
def ask_endpoint(req: QuestionRequest):
    try:
        result = ask_knowledge_base(req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge base error: {str(e)}")
    return {
        "question": req.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "accepted": result["accepted"],
    }

# API pembanding base model dengan RAG
@app.post("/api/v1/ask/base")
def ask_base_endpoint(req: QuestionRequest):
    try:
        answer = ask_base_model(req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Base model error: {str(e)}")
    return {
        "question": req.question,
        "answer": answer,
    }

@app.post("/api/v1/conversations")
def create_conversation_endpoint(authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return create_conversation(user_id)

@app.get("/api/v1/conversations")
def get_conversations_endpoint(authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return list_conversations(user_id)

@app.get("/api/v1/conversations/{conversation_id}")
def get_conversation_endpoint(conversation_id: int, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return get_conversation(user_id, conversation_id)

@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message_endpoint(conversation_id: int, req: MessageRequest, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return send_message(user_id, conversation_id, req.content)

@app.patch("/api/v1/conversations/{conversation_id}")
def update_conversation_endpoint(conversation_id: int, req: ConversationUpdateRequest, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return update_conversation(user_id, conversation_id, req.title)

@app.delete("/api/v1/conversations/{conversation_id}")
def delete_conversation_endpoint(conversation_id: int, authorization: str | None = Header(default=None)):
    user_id = get_user_id(authorization)
    return delete_conversation(user_id, conversation_id)