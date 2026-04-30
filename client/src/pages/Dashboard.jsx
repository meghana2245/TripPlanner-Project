import { useState, useEffect, useCallback } from "react";
import { Plane, Plus, Briefcase, Calendar, Clock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import TripModal from "../components/TripModal";
import SkeletonCard from "../components/SkeletonCard";
import UpcomingTripBanner from "../components/UpcomingTripBanner";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  // Pre-seeded destination from query param
  const [preDestination, setPreDestination] = useState("");
  const [preDestinationId, setPreDestinationId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripsRes, destsRes] = await Promise.all([
        api.get("/trips"),
        api.get("/destinations")
      ]);
      setTrips(tripsRes.data.data || []);
      setDestinations(destsRes.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Open modal with pre-seeded destination if query params exist
  useEffect(() => {
    const dest = searchParams.get("destination");
    const destId = searchParams.get("destinationId");
    if (dest) {
      setPreDestination(dest);
      setPreDestinationId(destId || "");
      setEditTrip(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const now = new Date();
  const upcoming = trips.filter((t) => new Date(t.startDate) >= now).length;
  const past = trips.filter((t) => new Date(t.endDate) < now).length;

  const openCreate = () => { setPreDestination(""); setPreDestinationId(""); setEditTrip(null); setModalOpen(true); };
  const openEdit = (trip) => { setPreDestination(""); setPreDestinationId(""); setEditTrip(trip); setModalOpen(true); };
  const handleDelete = (id) => setTrips((prev) => prev.filter((t) => t._id !== id));
  const handleClose = () => { setModalOpen(false); setEditTrip(null); setPreDestination(""); setPreDestinationId(""); };

  const stats = [
    { label: "Total Trips", value: trips.length, icon: Briefcase, color: "teal" },
    { label: "Upcoming", value: upcoming, icon: Calendar, color: "blue" },
    { label: "Past Trips", value: past, icon: Clock, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <UpcomingTripBanner trips={trips} destinations={destinations} />

      <PageTransition>
        {/* Hero */}
        <div className="relative pt-16 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            <p className="text-teal-400 text-sm font-medium uppercase tracking-widest mb-2">Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0]}! 🌍
            </h1>
            <p className="text-slate-400 text-lg">Ready for your next adventure?</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-slate-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-2xl">My Trips</h2>
            <button onClick={openCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
              <Plus className="w-4 h-4" />New Trip
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-24 bg-white/5 border border-white/10 border-dashed rounded-2xl">
              <Plane className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No trips yet</h3>
              <p className="text-slate-500 mb-6">Start planning your first adventure!</p>
              <button onClick={openCreate} className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-6 py-3 rounded-xl font-medium transition-all">
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, i) => (
                <div key={trip._id} className="animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <TripCard trip={trip} onEdit={openEdit} onDelete={handleDelete} destinations={destinations} />
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>

      {/* FAB */}
      <button onClick={openCreate} className="fixed bottom-8 right-8 w-14 h-14 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center transition-all hover:scale-110 z-40">
        <Plus className="w-6 h-6" />
      </button>

      <TripModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSuccess={fetchData}
        existingTrip={editTrip}
        preDestination={preDestination}
        preDestinationId={preDestinationId}
      />
    </div>
  );
}
