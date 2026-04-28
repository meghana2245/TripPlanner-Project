import { Link } from "react-router-dom";
import { MapPin, Calendar, Edit2, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
];

const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function TripCard({ trip, index = 0, onEdit, onDelete }) {
  const image = IMAGES[index % IMAGES.length];

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${trip.tripName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/trips/${trip._id}`);
      toast.success("Trip deleted");
      onDelete(trip._id);
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/40 h-72">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {/* Action buttons top-right */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.preventDefault(); onEdit(trip); }}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); handleDelete(); }}
          className="bg-red-500/30 backdrop-blur-sm hover:bg-red-500/50 p-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-xl mb-2 leading-tight">{trip.tripName}</h3>
        <div className="flex items-center gap-1 text-slate-300 text-sm mb-1">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {fmt(trip.startDate)} – {fmt(trip.endDate)}
        </div>
        <Link
          to={`/trips/${trip._id}`}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
