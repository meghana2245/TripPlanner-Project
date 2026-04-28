import { useState } from "react";
import { X, Loader2, Calendar, Tag, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];

export default function BookingModal({ isOpen, onClose, onSuccess, tripId }) {
  const [form, setForm] = useState({ bookingType: "Hotel", bookingName: "", checkInDate: today(), checkOutDate: today() });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingName.trim()) return toast.error("Booking name is required");
    setLoading(true);
    try {
      await api.post("/bookings", { ...form, tripId });
      toast.success("Booking added! 🏨");
      setForm({ bookingType: "Hotel", bookingName: "", checkInDate: today(), checkOutDate: today() });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">Add Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Booking Type</label>
            <div className="relative">
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <select value={form.bookingType} onChange={(e) => setForm((p) => ({ ...p, bookingType: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
                <option value="Hotel">🏨 Hotel</option>
                <option value="Flight">✈ Flight</option>
                <option value="Transport">🚌 Transport</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Booking Name</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={form.bookingName} onChange={(e) => setForm((p) => ({ ...p, bookingName: e.target.value }))} placeholder="e.g. Hilton Paris Opera" className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="date" value={form.checkInDate} onChange={(e) => setForm((p) => ({ ...p, checkInDate: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="date" value={form.checkOutDate} onChange={(e) => setForm((p) => ({ ...p, checkOutDate: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Add Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
