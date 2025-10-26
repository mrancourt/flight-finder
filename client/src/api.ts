// src/api.ts
import ky from "ky";

export type FlightRow = {
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  price_total?: string;
  currency?: string;
  validating_airline?: string;
  outbound_legs: string;
  return_legs: string;
  united_booking_link: string;
  price_total_num?: number;
};

export type FlightsResponse = {
  total: number;
  offset: number;
  limit: number;
  rows: FlightRow[];
};

// Use environment variable for API URL, fallback to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = ky.create({ prefixUrl: API_BASE_URL });

export const getFlights = (params: Record<string, string | number | undefined>) =>
  api.get("api/flights", { searchParams: params }).json<FlightsResponse>();

export const downloadCsvUrl = `${API_BASE_URL}/api/download`;
