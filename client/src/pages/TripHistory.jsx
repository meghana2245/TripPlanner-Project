import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Plane, ArrowRight, Clock, Users, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function TripHistory() {
  usePageTitle("Trip History");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/trips");
        const all = res.data.data || [];
        const now = new Date();
        setTrips(
          all
            .filter((t) => new Date(t.endDate) < now)
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
        );
      } catch {
        toast.error("Failed to load trip history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageTransition>
        {/* Hero */}
        <div className="relative pt-16 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&q=80)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/70 to-slate-900" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest">Past Adventures</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Trip History</h1>
            <p className="text-slate-400 text-lg">Relive your past journeys and adventures</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-slate-700 animate-pulse mt-1" />
                    <div className="w-0.5 flex-1 bg-slate-800 mt-2" />
                  </div>
                  <div className="flex-1 h-28 bg-slate-800 rounded-xl animate-pulse mb-6" />
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-24 bg-white/5 border border-white/10 border-dashed rounded-2xl">
              <Plane className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No past trips yet</h3>
              <p className="text-slate-500 mb-6">Your completed trips will appear here.</p>
              <Link
                to="/dashboard"
                className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-6 py-3 rounded-xl font-medium transition-all inline-block"
              >
                Plan a Trip
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-500/50 via-slate-700 to-transparent" />
              <div className="space-y-6">
                {trips.map((trip, i) => (
                  <div
                    key={trip._id}
                    className="flex gap-6 animate-slideUp"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0 mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          i === 0 ? "border-teal-500 bg-teal-500/20" : "border-slate-600 bg-slate-800"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-teal-400" : "bg-slate-600"}`} />
                      </div>
                      {i < trips.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 mt-2" />}
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-teal-500/30 transition-colors group mb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          </div>
                          <h3 className="text-white font-bold text-xl mb-2 leading-tight">{trip.tripName}</h3>
                          <div className="flex flex-wrap gap-4 text-sm mb-3">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              {trip.destination}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              {fmt(trip.startDate)} – {fmt(trip.endDate)}
                            </span>
                          </div>
                          {/* Budget + People badges */}
                          <div className="flex flex-wrap gap-2">
                            {trip.budget > 0 && (
                              <span className="flex items-center gap-1 text-xs bg-teal-500/15 border border-teal-500/25 text-teal-300 px-2.5 py-1 rounded-full">
                                <IndianRupee className="w-3 h-3" />
                                Budget: {fmtINR(trip.budget)}
                              </span>
                            )}
                            {trip.numberOfPeople > 0 && (
                              <span className="flex items-center gap-1 text-xs bg-white/8 border border-white/15 text-slate-300 px-2.5 py-1 rounded-full">
                                <Users className="w-3 h-3" />
                                {trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/trips/${trip._id}`}
                          className="shrink-0 flex items-center gap-1.5 bg-slate-700 hover:bg-teal-600 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all group-hover:bg-teal-600"
                        >
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
