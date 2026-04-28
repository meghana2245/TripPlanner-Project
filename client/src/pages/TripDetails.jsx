import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Plus, ArrowLeft, Activity, Hotel, Plane, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ActivityModal from "../components/ActivityModal";
import BookingModal from "../components/BookingModal";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

const IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
];

const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const typeStyle = {
  Hotel: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Flight: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Transport: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activities");
  const [actModal, setActModal] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  usePageTitle(trip?.tripName || "Trip Details");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [tripRes, actRes, bookRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/activities/trip/${id}`),
        api.get(`/bookings/trip/${id}`),
      ]);
      setTrip(tripRes.data.data);
      setActivities(actRes.data.data || []);
      setBookings(bookRes.data.data || []);
    } catch {
      toast.error("Failed to load trip details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const deleteActivity = async (actId) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await api.delete(`/activities/${actId}`);
      setActivities((p) => p.filter((a) => a._id !== actId));
      toast.success("Activity deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const deleteBooking = async (bookId) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await api.delete(`/bookings/${bookId}`);
      setBookings((p) => p.filter((b) => b._id !== bookId));
      toast.success("Booking deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const heroImage = trip ? IMAGES[parseInt(trip._id.slice(-1), 16) % IMAGES.length] : IMAGES[0];

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

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageTransition>

      {/* Hero */}
      <div className="relative pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-slate-900" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{trip.tripName}</h1>
          <div className="flex flex-wrap gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />{trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />{fmt(trip.startDate)} – {fmt(trip.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex border-b border-slate-800 mb-8">
          {["activities", "bookings"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "text-teal-400 border-teal-500"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {t} ({t === "activities" ? activities.length : bookings.length})
            </button>
          ))}
        </div>

        {/* Activities tab */}
        {tab === "activities" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Activities</h2>
              <button
                onClick={() => setActModal(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />Add Activity
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No activities planned yet</p>
                <button onClick={() => setActModal(true)} className="text-teal-400 hover:text-teal-300 text-sm">+ Add your first activity</button>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a._id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-teal-500/30 transition-colors">
                    <div>
                      <p className="text-white font-semibold">{a.activityName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" />{a.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                          <Calendar className="w-3.5 h-3.5" />{fmt(a.activityDate)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteActivity(a._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Bookings</h2>
              <button
                onClick={() => setBookModal(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />Add Booking
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                <Hotel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No bookings added yet</p>
                <button onClick={() => setBookModal(true)} className="text-teal-400 hover:text-teal-300 text-sm">+ Add your first booking</button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b._id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-teal-500/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${typeStyle[b.bookingType] || typeStyle.Hotel}`}>
                          {b.bookingType}
                        </span>
                        <p className="text-white font-semibold">{b.bookingName}</p>
                      </div>
                      <span className="flex items-center gap-1 text-slate-500 text-sm">
                        <Calendar className="w-3.5 h-3.5" />{fmt(b.checkInDate)} → {fmt(b.checkOutDate)}
                      </span>
                    </div>
                    <button onClick={() => deleteBooking(b._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ActivityModal isOpen={actModal} onClose={() => setActModal(false)} onSuccess={fetchAll} tripId={id} />
      <BookingModal isOpen={bookModal} onClose={() => setBookModal(false)} onSuccess={fetchAll} tripId={id} />
      </PageTransition>
    </div>
  );
}
