import os
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd

CSV_PATH = os.getenv("FLIGHTS_CSV", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "flights.csv")))

app = FastAPI(title="Flights CSV Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_csv() -> pd.DataFrame:
    if not os.path.exists(CSV_PATH):
        raise HTTPException(404, f"CSV not found at {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, dtype=str).fillna("")
    # ensure numeric sort works for price
    if "price_total" in df.columns:
        df["price_total_num"] = pd.to_numeric(df["price_total"], errors="coerce")
    else:
        df["price_total_num"] = None
    return df

@app.get("/api/flights")
def get_flights(
    origin: Optional[str] = Query(None, min_length=3, max_length=3),
    destination: Optional[str] = Query(None, min_length=3, max_length=3),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD inclusive"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD inclusive"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: str = Query("depart_date", regex="^(depart_date|return_date|price_total)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    offset: int = 0,
    limit: int = 200,
):
    df = load_csv()

    if origin:
        df = df[df["origin"].str.upper() == origin.upper()]
    if destination:
        df = df[df["destination"].str.upper() == destination.upper()]

    if start_date:
        df = df[df["depart_date"] >= start_date]
    if end_date:
        df = df[df["return_date"] <= end_date]

    if min_price is not None:
        df = df[(df["price_total_num"].isna()) | (df["price_total_num"] >= min_price)]
    if max_price is not None:
        df = df[(df["price_total_num"].isna()) | (df["price_total_num"] <= max_price)]

    if sort_by == "price_total":
        df = df.sort_values("price_total_num", ascending=(order == "asc"), na_position="last")
    else:
        df = df.sort_values(sort_by, ascending=(order == "asc"))

    total = len(df)
    df = df.iloc[offset: offset + limit]

    # return only original columns + price_total_num for convenience
    cols = [c for c in df.columns if c != "_raw_offer"]
    return {
        "total": int(total),
        "offset": offset,
        "limit": limit,
        "rows": df[cols].to_dict(orient="records"),
    }

@app.get("/api/download")
def download_csv():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(404, f"CSV not found at {CSV_PATH}")
    return FileResponse(CSV_PATH, media_type="text/csv", filename="flights.csv")

