export interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

export interface TripResponse {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget: number;
  recommended_transport: string;
  ai_recommendation: string | null;
  created_at: string;
}