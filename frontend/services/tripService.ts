import { TripRequest, TripResponse } from "@/types/trip";
import { getToken } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function getTrips(): Promise<TripResponse[]> {
  const res = await fetch(`${API_URL}/trips`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to load trips");
  }
  return res.json();
}

export async function getTrip(id: number): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Trip ${id} not found`);
  }
  return res.json();
}

export async function generateTrip(data: TripRequest): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/0/generate`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to generate trip");
  }
  return res.json();
}

export async function deleteTrip(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete trip");
  }
}