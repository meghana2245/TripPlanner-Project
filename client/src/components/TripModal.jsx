import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
      <input
        {...props}
        className={`w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
      />
    </div>
  </div>
);

export default function TripModal({ isOpen, onClose, onSuccess, existingTrip }) {
  const isEdit = !!existingTrip;
  const [form, setForm] = useState({ tripName: "", destination: "", startDate: today(), endDate: today() });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingTrip) {
      setForm({
        tripName: existingTrip.tripName || "",
        destination: existingTrip.destination || "",
        startDate: existingTrip.startDate ? existingTrip.startDate.split("T")[0] : today(),
        endDate: existingTrip.endDate ? existingTrip.endDate.split("T")[0] : today(),
      });
    } else {
      setForm({ tripName: "", destination: "", startDate: today(), endDate: today() });
    }
  }, [existingTrip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tripName.trim() || !form.destination.trim()) {
      return toast.error("Trip name and destination are required");
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/trips/${existingTrip._id}`, form);
        toast.success("Trip updated! ✈");
      } else {
        await api.post("/trips", form);
        toast.success("Trip created! 🌍");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Trip" : "Create New Trip"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Trip Name"
            icon={Tag}
            value={form.tripName}
            onChange={(e) => setForm((p) => ({ ...p, tripName: e.target.value }))}
            placeholder="e.g. Japan Adventure 2026"
          />
          <Input
            label="Destination"
            icon={MapPin}
            value={form.destination}
            onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
            placeholder="e.g. Tokyo, Japan"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              icon={Calendar}
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
            <Input
              label="End Date"
              icon={Calendar}
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
