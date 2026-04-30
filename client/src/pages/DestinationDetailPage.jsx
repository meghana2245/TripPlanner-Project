import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Users, ArrowRight,
  CheckCircle2, Plane, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getDestinationImage } from "../utils/getDestinationImage";

export default function DestinationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  usePageTitle(dest?.destinationName || "Destination");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/destinations/${id}`);
        setDest(res.data.data);
      } catch {
        toast.error("Failed to load destination");
        navigate("/destinations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePlanTrip = () => {
    if (!user) {
      toast.info("Please login to plan a trip ✈");
      navigate("/login");
      return;
    }
    navigate(`/dashboard?destination=${encodeURIComponent(dest.destinationName)}&destinationId=${id}`);
  };

  const toggleDay = (day) =>
    setExpandedDays((p) => ({ ...p, [day]: !p[day] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="pt-16">
          <div className="h-72 bg-slate-800 animate-pulse" />
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!dest) return null;

  const hasItinerary = dest.sampleItinerary && dest.sampleItinerary.length > 0;
  const sorted = hasItinerary
    ? [...dest.sampleItinerary].sort((a, b) => a.day - b.day)
    : [];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageTransition>

        {/* Hero */}
        <div className="relative pt-16 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: `url(${dest.imageUrl || getDestinationImage(dest.destinationName)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-slate-900" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
            <button
              onClick={() => navigate("/destinations")}
              className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              All Destinations
            </button>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {dest.destinationName}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mb-8 leading-relaxed">{dest.description}</p>

            <button
              onClick={handlePlanTrip}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <Plane className="w-5 h-5" /> Plan a Trip Here <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 pb-20 space-y-10">


          {/* Sample Itinerary */}
          {hasItinerary && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-2xl">Sample Itinerary</h2>
                  <p className="text-slate-500 text-sm mt-1">Curated day-by-day plan by our team · {sorted.length} days</p>
                </div>
                <button
                  onClick={handlePlanTrip}
                  className="flex items-center gap-2 bg-teal-600/20 hover:bg-teal-600 border border-teal-500/30 hover:border-teal-500 text-teal-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                >
                  Use This Itinerary <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {sorted.map((item) => {
                  const isOpen = expandedDays[item.day] !== false; // default expanded
                  return (
                    <div
                      key={item.day}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/20 transition-colors"
                    >
                      {/* Day header */}
                      <button
                        className="w-full flex items-center justify-between p-5 text-left"
                        onClick={() => toggleDay(item.day)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                            <span className="text-teal-400 font-bold text-sm">{item.day}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              Day {item.day}{item.title ? ` — ${item.title}` : ""}
                            </p>
                            {!isOpen && item.activities?.length > 0 && (
                              <p className="text-slate-500 text-xs mt-0.5">{item.activities.length} activities</p>
                            )}
                          </div>
                        </div>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-slate-500" />
                          : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {/* Activities */}
                      {isOpen && item.activities?.length > 0 && (
                        <div className="px-5 pb-5 space-y-2 border-t border-white/5 pt-4">
                          {item.activities.map((act, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                              <span className="text-slate-300 text-sm">{act}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA at bottom of itinerary */}
              <div className="mt-8 bg-gradient-to-r from-teal-600/20 to-teal-500/10 border border-teal-500/20 rounded-2xl p-6 text-center">
                <h3 className="text-white font-bold text-xl mb-2">Ready to visit {dest.destinationName}?</h3>
                <p className="text-slate-400 text-sm mb-5">Start a trip with this destination pre-filled. You can customize the itinerary once created.</p>
                <button
                  onClick={handlePlanTrip}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
                >
                  <Plane className="w-5 h-5" /> Start Planning <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* No itinerary fallback CTA */}
          {!hasItinerary && (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-slate-400 font-medium mb-1">No sample itinerary yet</h3>
              <p className="text-slate-600 text-sm mb-5">Our team is working on a curated plan for {dest.destinationName}.</p>
              <button
                onClick={handlePlanTrip}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                Plan Your Own Trip <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
