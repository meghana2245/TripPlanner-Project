import { useState, useEffect, useRef } from "react";
import { X, Loader2, Globe, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

export default function DestinationModal({ isOpen, onClose, onSuccess, existingDestination }) {
  const isEdit = !!existingDestination;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [places, setPlaces] = useState([]);
  const [placeInput, setPlaceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (existingDestination) {
        setName(existingDestination.destinationName || "");
        setDescription(existingDestination.description || "");
        setPlaces(existingDestination.recommendedPlaces || []);
      } else {
        setName(""); setDescription(""); setPlaces([]);
      }
      setPlaceInput("");
    }
  }, [isOpen, existingDestination]);

  if (!isOpen) return null;

  const addPlace = () => {
    const trimmed = placeInput.trim().replace(/,$/, "");
    if (trimmed && !places.includes(trimmed)) {
      setPlaces((p) => [...p, trimmed]);
    }
    setPlaceInput("");
  };

  const handlePlaceKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addPlace();
    }
  };

  const removePlace = (p) => setPlaces((prev) => prev.filter((x) => x !== p));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return toast.error("Name and description are required");
    setLoading(true);
    try {
      const payload = { destinationName: name.trim(), description: description.trim(), recommendedPlaces: places };
      if (isEdit) {
        await api.put(`/destinations/${existingDestination._id}`, payload);
        toast.success("Destination updated! 🌍");
      } else {
        await api.post("/destinations", payload);
        toast.success("Destination added! 🌍");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save destination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Destination" : "Add Destination"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination Name</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bali, Indonesia"
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this destination..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Recommended Places - chip input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Recommended Places</label>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 focus-within:ring-2 focus-within:ring-teal-500 transition-all min-h-[48px]">
              <div className="flex flex-wrap gap-2 mb-2">
                {places.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 bg-teal-600/20 text-teal-400 border border-teal-500/30 text-xs px-2.5 py-1 rounded-full">
                    {p}
                    <button type="button" onClick={() => removePlace(p)} className="hover:text-teal-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                  onKeyDown={handlePlaceKey}
                  placeholder='Type a place, press Enter or comma to add...'
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                />
                {placeInput.trim() && (
                  <button type="button" onClick={addPlace} className="text-teal-400 hover:text-teal-300">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
