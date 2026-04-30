import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Calendar, Plus, ArrowLeft, Activity, Hotel,
  Trash2, Pencil, Users, IndianRupee, TrendingUp, Bus,
  Plane, Train, Car, FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ActivityModal from "../components/ActivityModal";
import BookingModal from "../components/BookingModal";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

import { getDestinationImage } from "../utils/getDestinationImage";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const transportIcon = (mode) => {
  switch (mode) {
    case "Flight": return <Plane className="w-3 h-3" />;
    case "Train":  return <Train className="w-3 h-3" />;
    case "Car":    return <Car className="w-3 h-3" />;
    default:       return <Bus className="w-3 h-3" />;
  }
};

const bookingTypeStyle = {
  Hotel:     "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Transport: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activities");

  // Activity modal state
  const [actModal, setActModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Booking modal state
  const [bookModal, setBookModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

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

  // ── Activity handlers ──────────────────────────────────
  const openAddActivity = () => { setEditingActivity(null); setActModal(true); };
  const openEditActivity = (a) => { setEditingActivity(a); setActModal(true); };
  const closeActModal = () => { setActModal(false); setEditingActivity(null); };

  const deleteActivity = async (actId) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await api.delete(`/activities/${actId}`);
      setActivities((p) => p.filter((a) => a._id !== actId));
      toast.success("Activity deleted");
    } catch { toast.error("Failed to delete activity"); }
  };

  // ── Booking handlers ──────────────────────────────────
  const openAddBooking = () => { setEditingBooking(null); setBookModal(true); };
  const openEditBooking = (b) => { setEditingBooking(b); setBookModal(true); };
  const closeBookModal = () => { setBookModal(false); setEditingBooking(null); };

  const deleteBooking = async (bookId) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await api.delete(`/bookings/${bookId}`);
      setBookings((p) => p.filter((b) => b._id !== bookId));
      toast.success("Booking deleted");
    } catch { toast.error("Failed to delete booking"); }
  };

  // ── Budget calculations ───────────────────────────────
  const bookingCost = bookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0);
  const activityCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
  const totalSpent = bookingCost + activityCost;
  const budget = Number(trip?.budget) || 0;
  const spentPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = budget - totalSpent;
  const overBudget = remaining < 0;

  const heroImage = trip?.imageUrl || getDestinationImage(trip?.destination);

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
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
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
              {trip.numberOfPeople > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-400" />{trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">

          {/* ── Budget Tracker ─────────────────────────────── */}
          {budget > 0 && (
            <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <h2 className="text-white font-semibold text-lg">Budget Tracker</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                {/* Total Budget */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> Total Budget
                  </p>
                  <p className="text-white font-bold text-xl">{fmtINR(budget)}</p>
                </div>
                {/* Total Spent */}
                <div className={`rounded-xl p-4 border ${overBudget ? "bg-red-500/10 border-red-500/30" : "bg-slate-800/60 border-white/5"}`}>
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Total Spent
                  </p>
                  <p className={`font-bold text-xl ${overBudget ? "text-red-400" : "text-white"}`}>{fmtINR(totalSpent)}</p>
                  {(bookingCost > 0 || activityCost > 0) && (
                    <p className="text-slate-600 text-xs mt-1">
                      {bookingCost > 0 && `Bookings: ${fmtINR(bookingCost)}`}
                      {bookingCost > 0 && activityCost > 0 && " · "}
                      {activityCost > 0 && `Activities: ${fmtINR(activityCost)}`}
                    </p>
                  )}
                </div>
                {/* Remaining */}
                <div className={`rounded-xl p-4 border ${overBudget ? "bg-red-500/10 border-red-500/30" : "bg-teal-500/10 border-teal-500/20"}`}>
                  <p className="text-slate-400 text-xs mb-1">{overBudget ? "Over Budget" : "Remaining"}</p>
                  <p className={`font-bold text-xl ${overBudget ? "text-red-400" : "text-teal-300"}`}>{fmtINR(Math.abs(remaining))}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{fmtINR(totalSpent)} spent</span>
                  <span>{spentPct.toFixed(1)}% of budget</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${overBudget ? "bg-red-500" : spentPct > 80 ? "bg-orange-500" : "bg-teal-500"}`}
                    style={{ width: `${spentPct}%` }}
                  />
                </div>
                {overBudget && (
                  <p className="text-red-400 text-xs mt-1.5">⚠️ You've exceeded your budget by {fmtINR(Math.abs(remaining))}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Tab bar ──────────────────────────────────────── */}
          <div className="flex border-b border-slate-800 mb-8">
            {["activities", "bookings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? "text-teal-400 border-teal-500" : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {t} ({t === "activities" ? activities.length : bookings.length})
              </button>
            ))}
          </div>

          {/* ── Activities tab ────────────────────────────────── */}
          {tab === "activities" && (
            <div className="pb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-lg">Activities</h2>
                <button
                  onClick={openAddActivity}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                  <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No activities planned yet</p>
                  <button onClick={openAddActivity} className="text-teal-400 hover:text-teal-300 text-sm">
                    + Add your first activity
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div
                      key={a._id}
                      className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-teal-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{a.activityName}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-slate-400 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-teal-400" />
                              {a.placeName || a.location}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-sm">
                              <Calendar className="w-3.5 h-3.5" />{fmt(a.activityDate)}
                            </span>
                            {a.cost > 0 && (
                              <span className="flex items-center gap-1 text-teal-300 text-sm font-medium">
                                <IndianRupee className="w-3.5 h-3.5" />{fmtINR(a.cost)}
                              </span>
                            )}
                          </div>
                          {a.notes && (
                            <p className="text-slate-500 text-sm mt-2 flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-600" />
                              {a.notes}
                            </p>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEditActivity(a)}
                            className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteActivity(a._id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Bookings tab ──────────────────────────────────── */}
          {tab === "bookings" && (
            <div className="pb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold text-lg">Bookings</h2>
                  {bookings.length > 0 && (
                    <p className="text-slate-500 text-sm mt-0.5">
                      Total cost: <span className="text-teal-300 font-medium">{fmtINR(totalSpent)}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={openAddBooking}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                  <Hotel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No bookings added yet</p>
                  <button onClick={openAddBooking} className="text-teal-400 hover:text-teal-300 text-sm">
                    + Add your first booking
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b._id}
                      className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-teal-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Type badge */}
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${bookingTypeStyle[b.bookingType] || bookingTypeStyle.Hotel}`}>
                              {b.bookingType}
                            </span>
                            {/* Transport mode badge */}
                            {b.bookingType === "Transport" && b.transportMode && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1">
                                {transportIcon(b.transportMode)} {b.transportMode}
                              </span>
                            )}
                            <p className="text-white font-semibold">{b.bookingName}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-slate-500 text-sm">
                              <Calendar className="w-3.5 h-3.5" />{fmt(b.checkInDate)} → {fmt(b.checkOutDate)}
                            </span>
                            <span className="flex items-center gap-1 text-teal-300 font-medium text-sm">
                              <IndianRupee className="w-3.5 h-3.5" />{fmtINR(b.cost)}
                            </span>
                          </div>
                          {b.confirmationNumber && (
                            <p className="text-slate-600 text-xs mt-1">Ref: {b.confirmationNumber}</p>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEditBooking(b)}
                            className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBooking(b._id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <ActivityModal
          isOpen={actModal}
          onClose={closeActModal}
          onSuccess={fetchAll}
          tripId={id}
          trip={trip}
          existingActivity={editingActivity}
        />
        <BookingModal
          isOpen={bookModal}
          onClose={closeBookModal}
          onSuccess={fetchAll}
          tripId={id}
          trip={trip}
          existingBooking={editingBooking}
        />

      </PageTransition>
    </div>
  );
}
