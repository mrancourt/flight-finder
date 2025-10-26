#!/usr/bin/env python3
import os
import sys
import json
import time
import argparse
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

import requests
import pandas as pd
from dateutil.relativedelta import relativedelta, FR

# ---------- Amadeus base URLs ----------
AMADEUS_BASE = {
    "test": "https://test.api.amadeus.com",
    "prod": "https://api.amadeus.com",
}

# ---------- OAuth ----------
def get_token(client_id: str, client_secret: str, env: str = "test") -> str:
    """Fetch OAuth2 token from Amadeus."""
    auth_url = f"{AMADEUS_BASE[env]}/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
    }
    resp = requests.post(auth_url, headers=headers, data=data, timeout=20)
    if not resp.ok:
        try:
            details = resp.json()
        except Exception:
            details = {"text": resp.text[:500]}
        raise RuntimeError(f"Amadeus OAuth failed ({resp.status_code}) at {auth_url}: {details}")
    return resp.json()["access_token"]

# ---------- Dates ----------
def next_friday(start_date: datetime) -> datetime:
    """Return the next Friday on/after start_date (time preserved)."""
    if start_date.weekday() == 4:
        return start_date
    return start_date + relativedelta(weekday=FR)

def build_weekend_pairs(start_friday: datetime, weeks: int) -> List[Tuple[str, str]]:
    """List of (Fri, Sun) YYYY-MM-DD pairs."""
    pairs: List[Tuple[str, str]] = []
    for i in range(weeks):
        fri = (start_friday + timedelta(weeks=i)).date()
        sun = fri + timedelta(days=2)
        pairs.append((fri.isoformat(), sun.isoformat()))
    return pairs

# ---------- Flight Search ----------
def search_flights(
    token: str,
    env: str,
    origin: str,
    destination: str,
    depart_date: str,
    return_date: str,
    adults: int = 1,
    currency: str = "USD",
    cabin: Optional[str] = None,
    max_results: int = 250,
    nonstop: bool = True,
) -> Dict[str, Any]:
    """Call Amadeus Flight Offers Search (round trip)."""
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": depart_date,
        "returnDate": return_date,
        "adults": adults,
        "currencyCode": currency,
        "max": max_results,
        "includedAirlineCodes": "UA",
        "nonStop": "true" if nonstop else "false",
    }
    if cabin:
        params["travelClass"] = cabin  # ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST

    flights_url = f"{AMADEUS_BASE[env]}/v2/shopping/flight-offers"
    r = requests.get(flights_url, headers=headers, params=params, timeout=30)
    if r.status_code == 429:
        time.sleep(2)
        r = requests.get(flights_url, headers=headers, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def _is_ua_only_offer(offer: Dict[str, Any]) -> bool:
    """True if every segment is marketed or operated by UA."""
    all_marketing_ua = True
    all_operating_ua = True
    for itin in offer.get("itineraries", []):
        for seg in itin.get("segments", []):
            marketing = seg.get("carrierCode")
            operating = seg.get("operating", {}).get("carrierCode", marketing)
            all_marketing_ua &= (marketing == "UA")
            all_operating_ua &= (operating == "UA")
    return all_marketing_ua or all_operating_ua

def _is_nonstop(offer: Dict[str, Any]) -> bool:
    """True if each itinerary has exactly one segment (non-stop)."""
    for itin in offer.get("itineraries", []):
        segs = itin.get("segments", [])
        if len(segs) != 1:
            return False
    return True

def extract_ua_offers(payload: Dict[str, Any], enforce_nonstop: bool = True) -> List[Dict[str, Any]]:
    """
    Return flattened UA-only offers, optionally enforcing non-stop per itinerary.
    """
    data = payload.get("data", [])
    rows: List[Dict[str, Any]] = []

    for offer in data:
        if not _is_ua_only_offer(offer):
            continue
        if enforce_nonstop and not _is_nonstop(offer):
            continue

        price_total = (offer.get("price") or {}).get("grandTotal")
        currency = (offer.get("price") or {}).get("currency")
        validating = offer.get("validatingAirlineCodes", []) or offer.get("validatingAirlineCode")

        legs_summary: List[str] = []
        for itin in offer.get("itineraries", []):
            segs = []
            for seg in itin.get("segments", []):
                dep = seg["departure"]["iataCode"]
                arr = seg["arrival"]["iataCode"]
                dep_time = seg["departure"]["at"]
                arr_time = seg["arrival"]["at"]
                flight = f'{seg.get("carrierCode","")}{seg.get("number","")}'
                segs.append(f"{dep} {dep_time} → {arr} {arr_time} ({flight})")
            legs_summary.append(" | ".join(segs))

        rows.append({
            "validating_airline": ",".join(validating) if isinstance(validating, list) else (validating or ""),
            "price_total": price_total,
            "currency": currency,
            "outbound_legs": legs_summary[0] if len(legs_summary) > 0 else "",
            "return_legs": legs_summary[1] if len(legs_summary) > 1 else "",
            "_raw_offer": json.dumps(offer),
        })

    return rows

# ---------- CLI ----------
def parse_args():
    ap = argparse.ArgumentParser(
        description=("Find United (UA) Fri→Sun weekend fares SFO⇄Mammoth (BIH/MMH).")
    )
    ap.add_argument("--origin", default="SFO", help="Origin IATA (default SFO)")
    ap.add_argument("--dest", default="BIH", help="Destination IATA (default BIH; use MMH for Mammoth Yosemite)")
    ap.add_argument("--weeks", type=int, default=100, help="How many upcoming weekends to scan (default 12)")
    ap.add_argument("--start", default=None, help="Start Friday (YYYY-MM-DD). Defaults to next Friday.")
    ap.add_argument("--adults", type=int, default=1, help="Number of adults (default 1)")
    ap.add_argument("--currency", default="USD", help="Currency code (default USD)")
    ap.add_argument("--cabin", default=None, choices=["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"],
                    help="Cabin class filter")
    ap.add_argument("--outfile", default="flights.csv", help="CSV output file")
    ap.add_argument("--print", dest="do_print", action="store_true", help="Print table to stdout")
    ap.add_argument("--env", choices=["test", "prod"], default=os.getenv("AMADEUS_ENV", "test"),
                    help="Amadeus environment (default: test)")
    ap.add_argument("--nonstop", default="true", choices=["true", "false"],
                    help="Require non-stop flights (default: true)")
    return ap.parse_args()

# ---------- Main ----------
def main():
    args = parse_args()

    client_id = os.getenv("AMADEUS_CLIENT_ID")
    client_secret = os.getenv("AMADEUS_CLIENT_SECRET")
    if not client_id or not client_secret:
        print("ERROR: Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET env vars.", file=sys.stderr)
        sys.exit(1)

    # Resolve start Friday
    if args.start:
        try:
            start_dt = datetime.strptime(args.start, "%Y-%m-%d")
        except ValueError:
            print("ERROR: --start must be YYYY-MM-DD", file=sys.stderr)
            sys.exit(1)
    else:
        start_dt = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_dt = next_friday(start_dt)

    weekend_pairs = build_weekend_pairs(start_dt, args.weeks)
    token = get_token(client_id, client_secret, env=args.env)

    all_rows: List[Dict[str, Any]] = []
    enforce_nonstop = (args.nonstop.lower() == "true")

    for depart_date, return_date in weekend_pairs:
        try:
            payload = search_flights(
                token=token,
                env=args.env,
                origin=args.origin.upper(),
                destination=args.dest.upper(),
                depart_date=depart_date,
                return_date=return_date,
                adults=args.adults,
                currency=args.currency.upper(),
                cabin=args.cabin,
                nonstop=enforce_nonstop,
            )
            rows = extract_ua_offers(payload, enforce_nonstop=enforce_nonstop)
            for r in rows:
                r["depart_date"] = depart_date
                r["return_date"] = return_date
                r["origin"] = args.origin.upper()
                r["destination"] = args.dest.upper()

                # Add United booking link
                r["united_booking_link"] = (
                    f"https://www.united.com/en/us/fsr/choose-flights"
                    f"?f={args.origin.upper()}&t={args.dest.upper()}"
                    f"&d={depart_date}&r={return_date}&tqp=R"
                )
            all_rows.extend(rows)

        except requests.HTTPError as e:
            print(f"WARN: API error for {depart_date}→{return_date}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"WARN: Unexpected error for {depart_date}→{return_date}: {e}", file=sys.stderr)
            continue

        time.sleep(0.25)  # small courtesy delay

    if not all_rows:
        print("No UA offers found for the given parameters.")
        return

    # Sort by date then price
    def _price(p: Any) -> float:
        try:
            return float(p) if p is not None else 1e12
        except Exception:
            return 1e12

    all_rows.sort(key=lambda r: (r["depart_date"], _price(r["price_total"])))

    cols = [
        "origin", "destination", "depart_date", "return_date",
        "price_total", "currency", "validating_airline",
        "outbound_legs", "return_legs", "united_booking_link",
    ]   
    df = pd.DataFrame(all_rows, columns=cols)
    df.to_csv(args.outfile, index=False)
    print(f"Saved {len(df)} rows → {args.outfile}")

    if args.do_print:
        printable = df.copy()
        with pd.option_context("display.max_colwidth", 120, "display.width", 220):
            print(printable.to_string(index=False))

if __name__ == "__main__":
    main()
