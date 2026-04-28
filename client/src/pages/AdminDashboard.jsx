import { useState, useEffect, useCallback } from "react";
import { Globe, Briefcase, Users, Activity, Search, Edit2, Trash2, Plus, Menu, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import DestinationModal from "../components/DestinationModal";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

const DEST_IMAGES = {
  default: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  Tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
};

const getDestImage = (name = "") => {
  const key = Object.keys(DEST_IMAGES).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? DEST_IMAGES[key] : DEST_IMAGES.default;
};

const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const tripStatus = (trip) => {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return { label: "Upcoming", cls: "bg-teal-500/20 text-teal-400 border-teal-500/30" };
  if (now > end) return { label: "Past", cls: "bg-slate-700 text-slate-400 border-slate-600" };
  return { label: "Active", cls: "bg-green-500/20 text-green-400 border-green-500/30" };
};

// ─── OVERVIEW TAB ──────────────────────────────────────────────
function OverviewTab({ destinations, trips }) {
  const stats = [
    { label: "Total Destinations", value: destinations.length, icon: Globe, color: "teal" },
    { label: "Total Trips", value: trips.length, icon: Briefcase, color: "blue" },
    { label: "Active Users", value: 42, icon: Users, color: "purple" },
    { label: "Activities This Month", value: 128, icon: Activity, color: "orange" },
  ];
  const recent = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back! 👋</h1>
        <p className="text-slate-400">Here's what's happening on TripPlanner</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent Trips table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Recent Trips</h2>
          <p className="text-slate-500 text-sm">Latest 5 trips across the platform</p>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No trips yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/30">
                  {["Trip Name", "Destination", "Start", "End", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-slate-500 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((t) => {
                  const s = tripStatus(t);
                  return (
                    <tr key={t._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{t.tripName}</td>
                      <td className="px-6 py-4 text-slate-400">{t.destination}</td>
                      <td className="px-6 py-4 text-slate-400">{fmt(t.startDate)}</td>
                      <td className="px-6 py-4 text-slate-400">{fmt(t.endDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${s.cls}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DESTINATIONS TAB ──────────────────────────────────────────
function DestinationsTab({ destinations, onRefresh }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = destinations.filter((d) =>
    d.destinationName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/destinations/${id}`);
      toast.success("Destination deleted");
      onRefresh();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setModal(true); }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />Add Destination
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No destinations found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <div key={d._id} className="group relative rounded-2xl overflow-hidden h-64 transition-transform duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${getDestImage(d.destinationName)})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(d); setModal(true); }} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => handleDelete(d._id, d.destinationName)} className="bg-red-500/30 backdrop-blur-sm hover:bg-red-500/50 p-2 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-white" /></button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-xl mb-1">{d.destinationName}</h3>
                <p className="text-slate-300 text-sm line-clamp-2 mb-3">{d.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(d.recommendedPlaces || []).slice(0, 3).map((p) => (
                    <span key={p} className="text-xs bg-teal-600/30 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                  {(d.recommendedPlaces || []).length > 3 && (
                    <span className="text-xs text-slate-400">+{d.recommendedPlaces.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DestinationModal
        isOpen={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        onSuccess={onRefresh}
        existingDestination={editing}
      />
    </div>
  );
}

// ─── TRIPS TAB ────────────────────────────────────────────────
function TripsTab({ trips }) {
  const [search, setSearch] = useState("");
  const filtered = trips.filter((t) =>
    t.tripName?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trips..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/30">
                {["Trip Name", "Destination", "Start Date", "End Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-slate-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No trips found</td></tr>
              ) : filtered.map((t, i) => {
                const s = tripStatus(t);
                return (
                  <tr key={t._id} className={`hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="px-6 py-4 text-white font-medium">{t.tripName}</td>
                    <td className="px-6 py-4 text-slate-400">{t.destination}</td>
                    <td className="px-6 py-4 text-slate-400">{fmt(t.startDate)}</td>
                    <td className="px-6 py-4 text-slate-400">{fmt(t.endDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS TAB ──────────────────────────────────────────────
function ReportsTab({ destinations, trips }) {
  // Top destinations by trip count
  const destCounts = trips.reduce((acc, t) => {
    const key = t.destination || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topDests = Object.entries(destCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDest = topDests[0]?.[1] || 1;

  // Trips per month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthCounts = months.map((_, i) =>
    trips.filter((t) => new Date(t.startDate).getMonth() === i).length
  );
  const maxMonth = Math.max(...monthCounts, 1);

  const stats = [
    { label: "Total Destinations", value: destinations.length, icon: Globe, color: "teal" },
    { label: "Total Trips", value: trips.length, icon: Briefcase, color: "blue" },
    { label: "Active Users", value: 42, icon: Users, color: "purple" },
    { label: "Activities This Month", value: 128, icon: Activity, color: "orange" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Platform Overview</h2>
        <p className="text-slate-400">Analytics and insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top destinations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Top Destinations</h3>
          {topDests.length === 0 ? (
            <p className="text-slate-500 text-sm">No trip data yet</p>
          ) : (
            <div className="space-y-4">
              {topDests.map(([dest, count]) => (
                <div key={dest}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 text-sm truncate">{dest}</span>
                    <span className="text-teal-400 text-sm font-medium ml-2">{count} trip{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxDest) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trips per month bar chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Trips Per Month</h3>
          <div className="flex items-end justify-between gap-1 h-36">
            {months.map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all duration-700"
                    style={{ height: `${Math.max((monthCounts[i] / maxMonth) * 100, monthCounts[i] > 0 ? 8 : 0)}%` }}
                    title={`${monthCounts[i]} trips`}
                  />
                </div>
                <span className="text-slate-600 text-xs">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────
export default function AdminDashboard() {
  usePageTitle("Admin Dashboard");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [destRes, tripRes] = await Promise.all([
        api.get("/destinations"),
        api.get("/trips"),
      ]);
      setDestinations(destRes.data.data || []);
      setTrips(tripRes.data.data || []);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabTitles = { overview: "Overview", destinations: "Destinations", trips: "All Trips", reports: "Reports" };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold">Admin Panel</span>
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-slate-950/50 border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-white font-semibold text-lg">{tabTitles[activeTab]}</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-amber-500 text-xs mt-0.5">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <PageTransition>
            {activeTab === "overview" && <OverviewTab destinations={destinations} trips={trips} />}
            {activeTab === "destinations" && <DestinationsTab destinations={destinations} onRefresh={fetchData} />}
            {activeTab === "trips" && <TripsTab trips={trips} />}
            {activeTab === "reports" && <ReportsTab destinations={destinations} trips={trips} />}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
