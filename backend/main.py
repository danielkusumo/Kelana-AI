from services.trip_service import (get_trip_category, calculate_daily_budget, get_transport, get_recommendations)
from pydantic import BaseModel
from fastapi import FastAPI

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

@app.get("/")
def home():
    return {"message" : "Welcome to KelanaAI"}

@app.get("/health")
def status_check():
    return {"status" : "OK"}

@app.post("/api/v1/trips")
def create_trip(req: TripRequest):
    daily_budget = calculate_daily_budget(req.budget, req.days)
    category = get_trip_category(req.budget)
    recommended_transport = get_transport(req.travel_style) # asumsi travel_style seperti category
    return {
        "destination" : req.destination,
        "budget" : req.budget,
        "daily_budget" : daily_budget,
        "category" : category,
        "recommended_transport" : recommended_transport
    }

@app.get("/api/v1/trip-categories")
def list_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]

@app.get("/api/v1/recommendations")
def recommendations(destination: str):
    return get_recommendations(destination)

@app.get("/api/v1/transportations")
def transport():
    return ["Bus", "Train", "Flight"]