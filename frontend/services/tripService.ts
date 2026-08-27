import { TripRequest, TripResponse } from "@/types/trip";

const API_URL =
  process.env.API_URL || "http://localhost:8000/api/v1";

export async function getTrips(): Promise<TripResponse[]> {
  const res = await fetch(`${API_URL}/trips`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to load trips");
  }
  return res.json();
}

export async function getTrip(id: number): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Trip ${id} not found`);
  }
  return res.json();
}

export async function generateTrip(data: TripRequest): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/0/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to generate trip");
  }
  return res.json();
}