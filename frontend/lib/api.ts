import { TripRequest, TripResponse } from "@/types/trip";

export async function generateTrip(data: TripRequest): Promise<TripResponse> {
  // Proxy through Next.js API route to avoid CORS
  const res = await fetch("/api/trips/generate", {
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