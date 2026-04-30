import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, LogOut, Menu, Globe, Briefcase, Users, CalendarCheck, MapPin, Search, Plus, Pencil, Trash2, BarChart2, PieChart, Zap, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DestinationModal from "../components/DestinationModal";
import { getDestinationImage } from "../utils/getDestinationImage";

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getTripStatus = (startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start > today) return "Upcoming";
  if (end < today) return "Completed";
  return "Active";
};

const StatusBadge = ({ status }) => {
  let badgeClasses = "rounded-full px-3 py-1 text-xs font-medium border ";
  if (status === "Upcoming") {
    badgeClasses += "bg-teal-500/20 text-teal-300 border-teal-500/30";
  } else if (status === "Active") {
    badgeClasses += "bg-green-500/20 text-green-300 border-green-500/30";
  } else {
    badgeClasses += "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
  return <span className={badgeClasses}>{status}</span>;
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Destinations Tab State
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  
  // Trips Tab State
  const [tripSearchQuery, setTripSearchQuery] = useState("");
  const [tripFilter, setTripFilter] = useState("all");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);



  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'reports') {
      setBarsAnimated(false);
      const timer = setTimeout(() => setBarsAnimated(true), 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, destRes, usersRes] = await Promise.all([
        api.get("/trips"),
        api.get("/destinations"),
        api.get("/auth/users")
      ]);
      setTrips(tripsRes.data.data || []);
      setDestinations(destRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDestination = async (id, name) => {
    if (window.confirm(`Delete destination "${name}"?`)) {
      try {
        await api.delete(`/destinations/${id}`);
        toast.success("Destination deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting destination:", error);
        toast.error("Failed to delete destination");
      }
    }
  };

  // Derived Stats
  const totalTrips = trips.length;
  const totalDestinations = destinations.length;
  const activeUsers = new Set(trips.map(t => t.userId)).size;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingTrips = trips.filter(t => {
    const start = new Date(t.startDate);
    start.setHours(0,0,0,0);
    return start > today;
  }).length;
  
  const activeTrips = trips.filter(t => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return start <= today && end >= today;
  }).length;

  // Chart data — computed once, updated when trips changes
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyCount = useMemo(() => {
    const counts = Array(12).fill(0);
    trips.forEach(t => {
      if (t.startDate) {
        const d = new Date(t.startDate);
        if (!isNaN(d.getTime())) {
          counts[d.getMonth()]++;
        }
      }
    });
    return counts;
  }, [trips]);

  const maxMonthly = Math.max(...monthlyCount, 1);
  const hasAnyTrips = monthlyCount.some(c => c > 0);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully! 👋");
    navigate("/");
  };

  const tabs = ["overview", "destinations", "trips", "users", "reports"];
  const tabLabels = {
    overview: "Overview",
    destinations: "Destinations",
    trips: "All Trips",
    users: "Users",
    reports: "Reports",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300">
      {/* TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-white/10 z-40 flex items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Plane className="text-teal-500 w-6 h-6" />
            <span className="text-white font-bold text-lg hidden sm:block">TripPlanner</span>
            <span className="bg-teal-600/20 text-teal-400 text-xs px-2 py-0.5 rounded-full border border-teal-500/20">Admin</span>
          </div>
        </div>

        {/* Center - Desktop Tabs */}
        <div className="hidden lg:flex items-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Clickable profile */}
          <button
            onClick={() => navigate("/admin/profile")}
            className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{user?.name || "Admin"}</span>
            <UserCircle size={14} className="text-teal-400 opacity-60" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Tabs Scrollable Row */}
      <div className={`lg:hidden fixed top-16 left-0 right-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-30 transition-all duration-300 ${isMobileMenuOpen ? 'h-auto py-3 opacity-100' : 'h-0 py-0 opacity-0 overflow-hidden'}`}>
        <div className="flex px-4 gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? "bg-teal-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="pt-24 lg:pt-20 px-4 sm:px-6 pb-8 max-w-7xl mx-auto min-h-screen">
        
        {/* ==================================================== */}
        {/* OVERVIEW TAB */}
        {/* ==================================================== */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold text-white">Overview</h1>
              <p className="text-slate-400 mt-1">Here's what's happening on TripPlanner</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Card 1 */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-teal-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Globe className="text-teal-400" size={22} />
                </div>
                <div className="text-4xl font-bold text-white mt-3">{totalDestinations}</div>
                <div className="text-slate-400 text-sm mt-1">Total Destinations</div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                  {upcomingTrips} trips planned
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-75">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Briefcase className="text-blue-400" size={22} />
                </div>
                <div className="text-4xl font-bold text-white mt-3">{totalTrips}</div>
                <div className="text-slate-400 text-sm mt-1">Total Trips</div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                  {activeTrips} currently active
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-150">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="text-purple-400" size={22} />
                </div>
                <div className="text-4xl font-bold text-white mt-3">{activeUsers}</div>
                <div className="text-slate-400 text-sm mt-1">Active Users</div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                  Unique travelers
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-orange-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-225">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <CalendarCheck className="text-orange-400" size={22} />
                </div>
                <div className="text-4xl font-bold text-white mt-3">{upcomingTrips}</div>
                <div className="text-slate-400 text-sm mt-1">Upcoming Trips</div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                  Starting soon
                </div>
              </div>
            </div>

            {/* Recent Trips Section */}
            <div className="mt-8 bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden animate-slideUp delay-300">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="font-semibold text-white text-lg">Recent Trips</h2>
                <p className="text-sm text-slate-400">Latest 5 trips on the platform</p>
              </div>
              
              {trips.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-700/30 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Trip Name</th>
                        <th className="px-6 py-3 font-medium">Destination</th>
                        <th className="px-6 py-3 font-medium">Start Date</th>
                        <th className="px-6 py-3 font-medium">End Date</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.slice().reverse().slice(0, 5).map((trip) => (
                        <tr key={trip._id} className="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{trip.tripName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            <MapPin className="inline size-3.5 text-teal-400 mr-1.5" />
                            {trip.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{formatDate(trip.startDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{formatDate(trip.endDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={getTripStatus(trip.startDate, trip.endDate)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Briefcase className="size-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No trips yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* DESTINATIONS TAB */}
        {/* ==================================================== */}
        {activeTab === "destinations" && (
          <div className="animate-fadeIn">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Destinations</h1>
              <span className="bg-teal-500/20 text-teal-300 rounded-full px-2 py-0.5 text-sm ml-3 font-medium">
                {totalDestinations}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  setEditingDestination(null);
                  setShowDestinationModal(true);
                }}
                className="bg-teal-600 hover:bg-teal-500 transition-colors rounded-xl px-5 py-2.5 text-white font-medium flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-teal-900/20"
              >
                <Plus size={18} />
                Add Destination
              </button>
            </div>

            {destinations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {destinations.filter(d => d.destinationName?.toLowerCase().includes(destSearchQuery.toLowerCase())).map((dest) => (
                  <div key={dest._id} className="h-72 rounded-2xl overflow-hidden relative cursor-pointer group animate-slideUp">
                    <img 
                      src={dest.imageUrl || getDestinationImage(dest.destinationName)} 
                      alt={dest.destinationName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/50 backdrop-blur rounded-lg p-1.5 flex gap-1 border border-white/10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingDestination(dest); setShowDestinationModal(true); }}
                          className="p-1.5 text-slate-300 hover:text-teal-400 hover:bg-white/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteDestination(dest._id, dest.destinationName); }}
                          className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">{dest.destinationName}</h3>
                      <p className="text-sm text-slate-300 line-clamp-1 mb-2 leading-relaxed">{dest.description}</p>

                      {/* Recommended Places */}
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {dest.recommendedPlaces?.slice(0, 2).map((place, idx) => (
                          <span key={idx} className="bg-teal-500/30 text-teal-200 border border-teal-500/40 rounded-full px-2.5 py-0.5 text-xs">
                            {place}
                          </span>
                        ))}
                        {dest.recommendedPlaces?.length > 2 && (
                          <span className="bg-slate-800/60 text-slate-300 border border-slate-600 rounded-full px-2.5 py-0.5 text-xs">
                            +{dest.recommendedPlaces.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Destination Activities */}
                      {dest.destinationActivities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="flex items-center gap-0.5 text-orange-400 text-xs">
                            <Zap size={10} /> Activities:
                          </span>
                          {dest.destinationActivities.slice(0, 2).map((act, idx) => (
                            <span key={idx} className="bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5 text-xs">
                              {act}
                            </span>
                          ))}
                          {dest.destinationActivities.length > 2 && (
                            <span className="bg-slate-800/60 text-slate-400 border border-slate-600 rounded-full px-2 py-0.5 text-xs">
                              +{dest.destinationActivities.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-800/20 rounded-2xl border border-white/5 border-dashed mt-8">
                <Globe className="size-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-300 text-lg font-medium mb-1">No destinations added yet</h3>
                <p className="text-slate-500 text-sm mb-6">Add your first destination to get started</p>
                <button 
                  onClick={() => { setEditingDestination(null); setShowDestinationModal(true); }}
                  className="bg-teal-600/20 text-teal-400 hover:bg-teal-600 hover:text-white transition-colors border border-teal-500/30 rounded-xl px-5 py-2 font-medium inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Destination
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* ALL TRIPS TAB */}
        {/* ==================================================== */}
        {activeTab === "trips" && (
          <div className="animate-fadeIn">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold text-white">All Trips</h1>
              <span className="bg-teal-500/20 text-teal-300 rounded-full px-2 py-0.5 text-sm ml-3 font-medium">
                {totalTrips}
              </span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="text"
                placeholder="Search by trip name or destination..."
                value={tripSearchQuery}
                onChange={(e) => setTripSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {['all', 'upcoming', 'active', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTripFilter(filter)}
                  className={`capitalize px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    tripFilter === filter
                      ? "bg-teal-600 text-white shadow-md shadow-teal-900/30"
                      : "bg-slate-800/60 text-slate-400 border border-white/10 hover:border-teal-500/30 hover:text-slate-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/30 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Trip Name</th>
                      <th className="px-6 py-4 font-medium">Destination</th>
                      <th className="px-6 py-4 font-medium">Start Date</th>
                      <th className="px-6 py-4 font-medium">End Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredTrips = trips.filter(trip => {
                        const matchesSearch = 
                          trip.tripName?.toLowerCase().includes(tripSearchQuery.toLowerCase()) || 
                          trip.destination?.toLowerCase().includes(tripSearchQuery.toLowerCase());
                        
                        if (!matchesSearch) return false;
                        if (tripFilter === 'all') return true;
                        
                        const status = getTripStatus(trip.startDate, trip.endDate).toLowerCase();
                        return status === tripFilter;
                      });

                      if (filteredTrips.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" className="px-6 py-16 text-center">
                              <Search className="size-10 text-slate-600 mx-auto mb-3 opacity-50" />
                              <p className="text-slate-400">No trips found matching your search</p>
                            </td>
                          </tr>
                        );
                      }

                      return filteredTrips.map((trip, idx) => (
                        <tr key={trip._id} className={`hover:bg-teal-500/5 transition-colors border-b border-white/5 last:border-0 ${idx % 2 !== 0 ? 'bg-slate-800/20' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{trip.tripName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            <MapPin className="inline size-3.5 text-teal-400 mr-1.5" />
                            {trip.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{formatDate(trip.startDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{formatDate(trip.endDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={getTripStatus(trip.startDate, trip.endDate)} />
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-slate-700/20 border-t border-white/5 text-sm text-slate-500 flex justify-between items-center">
                <span>
                  Showing {trips.filter(t => {
                    const matchesSearch = t.tripName?.toLowerCase().includes(tripSearchQuery.toLowerCase()) || t.destination?.toLowerCase().includes(tripSearchQuery.toLowerCase());
                    const matchesFilter = tripFilter === 'all' || getTripStatus(t.startDate, t.endDate).toLowerCase() === tripFilter;
                    return matchesSearch && matchesFilter;
                  }).length} of {trips.length} trips
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* USERS TAB */}
        {/* ==================================================== */}
        {activeTab === "users" && (
          <div className="animate-fadeIn">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold text-white">All Users</h1>
              <span className="bg-teal-500/20 text-teal-300 rounded-full px-2 py-0.5 text-sm ml-3 font-medium">
                {users.length}
              </span>
            </div>

            <div className="bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/30 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Trips Created</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <p className="text-slate-400">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((u, idx) => (
                        <tr key={u._id} className={`hover:bg-teal-500/5 transition-colors border-b border-white/5 last:border-0 ${idx % 2 !== 0 ? 'bg-slate-800/20' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {(u.name || "U").charAt(0).toUpperCase()}
                            </div>
                            {u.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">{u.email}</td>
                          <td className="px-6 py-4 text-slate-300 max-w-xs">
                            {u.tripCount > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-medium inline-block w-fit mb-1">{u.tripCount} trips</span>
                                <div className="flex flex-wrap gap-1">
                                  {u.trips?.map((t, i) => (
                                    <span key={i} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded border border-white/5 truncate max-w-[150px]" title={t.tripName}>
                                      {t.tripName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* REPORTS TAB */}
        {/* ==================================================== */}
        {activeTab === "reports" && (() => {
          // Destination frequency
          const destCount = {};
          trips.forEach(t => {
            if (t.destination) destCount[t.destination] = (destCount[t.destination] || 0) + 1;
          });
          const topDestinations = Object.entries(destCount).sort((a,b) => b[1]-a[1]).slice(0,5);
          const maxDestCount = topDestinations[0]?.[1] || 1;

          // Status breakdown
          const statusCounts = { upcoming: 0, active: 0, completed: 0 };
          trips.forEach(t => {
            const start = new Date(t.startDate);
            const end = new Date(t.endDate);
            if (start > today) statusCounts.upcoming++;
            else if (end < today) statusCounts.completed++;
            else statusCounts.active++;
          });

          return (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-white">Reports</h1>
              <p className="text-slate-400 mt-1 mb-6">Platform analytics and insights</p>

              {/* SECTION 1 - Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-teal-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Globe className="text-teal-400" size={22} />
                  </div>
                  <div className="text-4xl font-bold text-white mt-3">{totalDestinations}</div>
                  <div className="text-slate-400 text-sm mt-1">Total Destinations</div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                    {upcomingTrips} trips planned
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-75">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Briefcase className="text-blue-400" size={22} />
                  </div>
                  <div className="text-4xl font-bold text-white mt-3">{totalTrips}</div>
                  <div className="text-slate-400 text-sm mt-1">Total Trips</div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                    {activeTrips} currently active
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-150">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Users className="text-purple-400" size={22} />
                  </div>
                  <div className="text-4xl font-bold text-white mt-3">{activeUsers}</div>
                  <div className="text-slate-400 text-sm mt-1">Active Users</div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                    Unique travelers
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 hover:border-orange-500/30 hover:bg-slate-800/80 transition-all duration-200 animate-slideUp delay-225">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <CalendarCheck className="text-orange-400" size={22} />
                  </div>
                  <div className="text-4xl font-bold text-white mt-3">{upcomingTrips}</div>
                  <div className="text-slate-400 text-sm mt-1">Upcoming Trips</div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                    Starting soon
                  </div>
                </div>
              </div>

              {/* SECTION 2 - Trips Per Month (fixed pixel-height bar chart) */}
              <div className="mt-8 bg-slate-800/40 rounded-2xl border border-white/5 p-6 animate-slideUp delay-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="text-teal-400" size={20} />
                    <span className="font-semibold text-white">Trips Per Month</span>
                  </div>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">{currentYear}</span>
                </div>

                {hasAnyTrips ? (
                  <div className="flex items-end gap-1 h-48 px-1">
                    {monthlyCount.map((count, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
                        {/* Count label */}
                        <span className="text-xs text-slate-400" style={{ minHeight: '16px' }}>
                          {count > 0 ? count : ''}
                        </span>
                        {/* Bar */}
                        <div
                          className="w-full rounded-t-md transition-all duration-700 ease-out"
                          style={{
                            height: barsAnimated
                              ? `${Math.max((count / maxMonthly) * 160, count > 0 ? 8 : 4)}px`
                              : '4px',
                            background: i === currentMonth
                              ? 'linear-gradient(to top, #0f766e, #2dd4bf)'
                              : count > 0
                                ? 'linear-gradient(to top, #0d9488, #5eead4)'
                                : '#1e293b',
                            opacity: count > 0 ? 1 : 0.4,
                          }}
                          title={`${monthLabels[i]}: ${count} trip${count !== 1 ? 's' : ''}`}
                        />
                        {/* Month label */}
                        <span
                          className="text-xs mt-1"
                          style={{ color: i === currentMonth ? '#2dd4bf' : '#64748b' }}
                        >
                          {monthLabels[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center gap-3">
                    <BarChart2 size={40} className="text-slate-600" />
                    <p className="text-slate-500 text-sm">No trip data yet</p>
                    <p className="text-slate-600 text-xs">Trips will appear here once users start planning</p>
                  </div>
                )}
              </div>

              {/* SECTION 3 - Two column grid */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp delay-300">
                
                {/* LEFT CARD - Top Destinations */}
                <div className="bg-slate-800/40 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-teal-400" size={20} />
                    <span className="font-semibold text-white">Top Destinations</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 mb-5">Most visited destinations</p>
                  
                  {topDestinations.length === 0 ? (
                    <div className="py-8 text-center">
                      <MapPin className="size-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500">No trip data yet</p>
                    </div>
                  ) : (
                    <div>
                      {topDestinations.map(([dest, count], index) => (
                        <div key={dest} className={index !== topDestinations.length - 1 ? "mb-4" : ""}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-white">{dest}</span>
                            <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                              {count} trip{count > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                              style={{ width: animated ? `${(count / maxDestCount) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT CARD - Trip Status Breakdown */}
                <div className="bg-slate-800/40 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-2">
                    <PieChart className="text-teal-400" size={20} />
                    <span className="font-semibold text-white">Status Breakdown</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 mb-5">Distribution of all trips</p>
                  
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-400 inline-block mr-2"></span>
                        <span className="text-sm text-white">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">{statusCounts.active} trips</span>
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                          {trips.length > 0 ? Math.round((statusCounts.active / trips.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-700"
                        style={{ width: animated && trips.length > 0 ? `${(statusCounts.active / trips.length) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>
                        <span className="text-sm text-white">Upcoming</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">{statusCounts.upcoming} trips</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                          {trips.length > 0 ? Math.round((statusCounts.upcoming / trips.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: animated && trips.length > 0 ? `${(statusCounts.upcoming / trips.length) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-slate-500 inline-block mr-2"></span>
                        <span className="text-sm text-white">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">{statusCounts.completed} trips</span>
                        <span className="text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-full">
                          {trips.length > 0 ? Math.round((statusCounts.completed / trips.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-500 rounded-full transition-all duration-700"
                        style={{ width: animated && trips.length > 0 ? `${(statusCounts.completed / trips.length) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 text-center text-sm text-slate-500">
                    Total: {trips.length} trip{trips.length !== 1 ? 's' : ''} recorded
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </main>



      {/* DESTINATION MODAL */}
      <DestinationModal
        isOpen={showDestinationModal}
        onClose={() => {
          setShowDestinationModal(false);
          setEditingDestination(null);
        }}
        onSuccess={() => {
          fetchData();
          setShowDestinationModal(false);
          setEditingDestination(null);
        }}
        existingDestination={editingDestination}
      />
    </div>
  );
}
