import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Plane } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Navbar from "../components/Navbar";
import SkeletonCard from "../components/SkeletonCard";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getDestinationImage } from "../utils/getDestinationImage";

export default function DestinationPage() {
  usePageTitle("Explore Destinations");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/destinations");
        setDestinations(res.data.data || []);
      } catch { toast.error("Failed to load destinations"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handlePlanTrip = (destName, destId) => {
    if (user) {
      navigate(`/dashboard?destination=${encodeURIComponent(destName)}&destinationId=${destId}`);
    } else {
      toast.info("Please login to plan a trip ✈");
      navigate("/login");
    }
  };

  const handleViewDetail = (destId) => {
    navigate(`/destinations/${destId}`);
  };

  const filtered = destinations.filter((d) => d.destinationName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageTransition>
        {/* Hero */}
        <div className="relative pt-16 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/70 to-slate-900" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
            <p className="text-teal-400 text-sm font-medium uppercase tracking-widest mb-3">Discover the World</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">Explore Destinations</h1>
            <p className="text-slate-300 text-xl mb-10">Discover amazing places around the world</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search destinations..." className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 pb-20">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white/5 border border-white/10 border-dashed rounded-2xl">
              <Plane className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">No destinations found</h3>
              <p className="text-slate-500">{search ? `No results for "${search}"` : "Check back soon."}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-6">{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((d, i) => (
                  <div key={d._id} className="group relative rounded-2xl overflow-hidden h-80 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/40 animate-slideUp cursor-pointer" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => handleViewDetail(d._id)}>
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${d.imageUrl || getDestinationImage(d.destinationName)})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-2xl mb-1">{d.destinationName}</h3>
                      <p className="text-slate-300 text-sm line-clamp-2 mb-3">{d.description}</p>
                      <button onClick={(e) => { e.stopPropagation(); handlePlanTrip(d.destinationName, d._id); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
                        Plan a Trip Here <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
