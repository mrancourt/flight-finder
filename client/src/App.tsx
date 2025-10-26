import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { getFlights, downloadCsvUrl } from "./api";
import type { FlightRow } from "./api";
import './index.css';

type Query = {
  origin?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  min_price?: string;
  max_price?: string;
  sort_by?: "depart_date" | "return_date" | "price_total";
  order?: "asc" | "desc";
  offset?: number;
  limit?: number;
};

const DEFAULT_QUERY: Query = {
  sort_by: "depart_date",
  order: "asc",
  limit: 100,
  offset: 0,
};

export default function App() {
  const [q, setQ] = useState<Query>(DEFAULT_QUERY);
  const [data, setData] = useState<FlightRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (params?: Partial<Query>) => {
    setLoading(true); setErr(null);
    const merged = { ...q, ...(params || {}) };
    try {
      const resp = await getFlights(merged as any);
      setQ(merged);
      setData(resp.rows);
      setTotal(resp.total);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* initial */ }, []);

  const onSort = (k: Query["sort_by"]) => {
    if (q.sort_by === k) {
      load({ order: q.order === "asc" ? "desc" : "asc" });
    } else {
      load({ sort_by: k, order: "asc" });
    }
  };

  const nextPage = () => {
    if ((q.offset ?? 0) + (q.limit ?? 100) < total) {
      load({ offset: (q.offset ?? 0) + (q.limit ?? 100) });
    }
  };
  const prevPage = () => {
    if ((q.offset ?? 0) > 0) {
      load({ offset: Math.max(0, (q.offset ?? 0) - (q.limit ?? 100)) });
    }
  };

  const headerClass = (k: Query["sort_by"]) =>
    "cursor-pointer select-none hover:text-blue-400 transition-colors flex items-center gap-1 " +
    (q.sort_by === k ? "text-blue-400 font-semibold" : "text-slate-300");

  const priceFmt = (r: FlightRow) =>
    r.price_total ? `$${r.price_total}` : "—";

  const rangeInfo = useMemo(() => {
    const off = q.offset ?? 0;
    const lim = q.limit ?? 100;
    const a = total ? off + 1 : 0;
    const b = Math.min(off + lim, total);
    return `${a}-${b} of ${total}`;
  }, [q.offset, q.limit, total]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                ✈️ Flight Finder
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                SFO ⇄ Mammoth (Friday → Sunday) • United Airlines
              </p>
            </div>
            <a
              href={downloadCsvUrl}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </a>
          </div>
        </header>

        {/* Filters Card */}
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Origin</label>
              <input
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 transition-all"
                placeholder="SFO"
                value={q.origin ?? ""}
                onChange={(e) => setQ({ ...q, origin: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination</label>
              <input
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 transition-all"
                placeholder="MMH"
                value={q.destination ?? ""}
                onChange={(e) => setQ({ ...q, destination: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={q.start_date ?? ""}
                onChange={(e) => setQ({ ...q, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={q.end_date ?? ""}
                onChange={(e) => setQ({ ...q, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Price</label>
              <input
                type="number"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 transition-all"
                placeholder="$150"
                value={q.min_price ?? ""}
                onChange={(e) => setQ({ ...q, min_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Price</label>
              <input
                type="number"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 transition-all"
                placeholder="$450"
                value={q.max_price ?? ""}
                onChange={(e) => setQ({ ...q, max_price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => load({ offset: 0 })}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Flights
                </span>
              )}
            </button>
            <button
              className="px-6 py-2.5 rounded-lg border-2 border-slate-600 text-slate-300 font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={() => { setQ(DEFAULT_QUERY); load({ ...DEFAULT_QUERY }); }}
              disabled={loading}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          {/* Results header */}
          <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Flight Results
                {total > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({total} flights found)</span>}
              </h2>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <button className={headerClass("depart_date")} onClick={() => onSort("depart_date")}>
                      Departure
                      {q.sort_by === "depart_date" && (
                        <span className="text-xs">{q.order === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <button className={headerClass("return_date")} onClick={() => onSort("return_date")}>
                      Return
                      {q.sort_by === "return_date" && (
                        <span className="text-xs">{q.order === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Outbound Stops
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Return Stops
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <button className={headerClass("price_total")} onClick={() => onSort("price_total")}>
                      Price
                      {q.sort_by === "price_total" && (
                        <span className="text-xs ml-1">{q.order === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Book
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                {data.map((r, i) => {
                  // Parse flight legs to extract times and convert to 12-hour format
                  const parseFlightTime = (legs: string) => {
                    const match = legs.match(/(\d{1,2}):(\d{2})/);
                    if (!match) return '';

                    let hours = parseInt(match[1]);
                    const minutes = match[2];
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12;

                    return `${hours}:${minutes} ${ampm}`;
                  };

                  // Parse duration from legs (e.g., "1h 30m")
                  const parseDuration = (legs: string) => {
                    const match = legs.match(/(\d+h\s*\d+m)/);
                    return match ? match[1] : '';
                  };

                  const outboundTime = parseFlightTime(r.outbound_legs);
                  const returnTime = parseFlightTime(r.return_legs);
                  const outboundDuration = parseDuration(r.outbound_legs);
                  const returnDuration = parseDuration(r.return_legs);

                  // Count stops
                  const outboundStops = (r.outbound_legs.match(/→/g) || []).length;
                  const returnStops = (r.return_legs.match(/→/g) || []).length;

                  return (
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-white">
                          {r.origin}
                          <svg className="w-4 h-4 mx-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          {r.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{dayjs(r.depart_date).format("MMM DD")}</div>
                        {outboundTime && <div className="text-xs text-slate-400">{outboundTime}</div>}
                        {outboundDuration && <div className="text-xs text-slate-500">{outboundDuration}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{dayjs(r.return_date).format("MMM DD")}</div>
                        {returnTime && <div className="text-xs text-slate-400">{returnTime}</div>}
                        {returnDuration && <div className="text-xs text-slate-500">{returnDuration}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {outboundStops === 1 ? "Direct" : `${outboundStops} stop${outboundStops > 1 ? 's' : ''}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {returnStops === 1 ? "Direct" : `${returnStops} stop${returnStops > 1 ? 's' : ''}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-bold text-emerald-400">{priceFmt(r)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                          href={r.united_booking_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Book
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {!data.length && !loading && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-400" colSpan={7}>
                      <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium text-slate-300">No flights found</p>
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your search filters</p>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={7}>
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-slate-300 font-medium">Searching for flights...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-slate-300">
                Showing <span className="font-semibold text-white">{rangeInfo}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg border-2 border-slate-600 text-slate-300 font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={prevPage}
                  disabled={(q.offset ?? 0) <= 0 || loading}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </span>
                </button>
                <button
                  className="px-4 py-2 rounded-lg border-2 border-slate-600 text-slate-300 font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={nextPage}
                  disabled={(q.offset ?? 0) + (q.limit ?? 100) >= total || loading}
                >
                  <span className="flex items-center">
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mt-4 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 font-medium">{err}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Flight data provided by United Airlines • Prices may vary</p>
        </footer>
      </div>
    </div>
  );
}

