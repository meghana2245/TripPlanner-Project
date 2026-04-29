import { useState, useEffect } from "react";
import { X, Loader2, Calendar, Tag, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const inputCls = (hasIcon = true) =>
  `w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`;

const TRANSPORT_MODES = ["Bus", "Train", "Car", "Flight"];

export default function BookingModal({ isOpen, onClose, onSuccess, tripId, trip, existingBooking }) {
  const isEdit = !!existingBooking;
  const tripStart = trip?.startDate ? trip.startDate.split("T")[0] : "";
  const tripEnd   = trip?.endDate   ? trip.endDate.split("T")[0]   : "";

  const [form, setForm] = useState({
    bookingType: "Hotel",
    transportMode: "Bus",
    bookingName: "",
    checkInDate: tripStart || "",
    checkOutDate: tripStart || "",
    cost: "",
    confirmationNumber: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingBooking) {
      setForm({
        bookingType: existingBooking.bookingType || "Hotel",
        transportMode: existingBooking.transportMode || "Bus",
        bookingName: existingBooking.bookingName || "",
        checkInDate: existingBooking.checkInDate ? existingBooking.checkInDate.split("T")[0] : tripStart,
        checkOutDate: existingBooking.checkOutDate ? existingBooking.checkOutDate.split("T")[0] : tripStart,
        cost: existingBooking.cost !== undefined ? String(existingBooking.cost) : "",
        confirmationNumber: existingBooking.confirmationNumber || "",
      });
    } else {
      setForm({ bookingType: "Hotel", transportMode: "Bus", bookingName: "", checkInDate: tripStart || "", checkOutDate: tripStart || "", cost: "", confirmationNumber: "" });
    }
  }, [existingBooking, isOpen, tripStart]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingName.trim()) return toast.error("Booking name is required");
    if (!form.checkInDate) return toast.error("Start date is required");
    if (!form.checkOutDate) return toast.error("End date is required");
    if (!form.cost || isNaN(Number(form.cost)) || Number(form.cost) < 0)
      return toast.error("Please enter a valid cost amount");
    if (form.bookingType === "Transport" && !form.transportMode)
      return toast.error("Please select a transport mode");

    setLoading(true);
    const payload = {
      ...form,
      cost: Number(form.cost),
      transportMode: form.bookingType === "Transport" ? form.transportMode : "",
    };
    try {
      if (isEdit) {
        await api.put(`/bookings/${existingBooking._id}`, payload);
        toast.success("Booking updated! ✏️");
      } else {
        await api.post("/bookings", { ...payload, tripId });
        toast.success("Booking added! 🏨");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  const modeIcons = { Bus: "🚌", Train: "🚆", Car: "🚗", Flight: "✈️" };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Booking" : "Add Booking"}</h2>
              {trip && <p className="text-slate-500 text-xs mt-0.5">Trip: {tripStart} → {tripEnd}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Booking Type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {["Hotel", "Transport"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, bookingType: type }))}
                    className={`py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                      form.bookingType === type
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {type === "Hotel" ? "🏨" : "🚌"} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Mode */}
            {form.bookingType === "Transport" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Transport Mode <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSPORT_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, transportMode: mode }))}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                        form.transportMode === mode
                          ? "bg-orange-600/30 border-orange-500 text-orange-300"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {modeIcons[mode]} {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {form.bookingType === "Hotel" ? "Hotel Name" : "Service / Provider"} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={form.bookingName}
                  onChange={set("bookingName")}
                  placeholder={form.bookingType === "Hotel" ? "e.g. Hilton Paris Opera" : "e.g. IndiGo 6E-123"}
                  className={inputCls()}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {form.bookingType === "Hotel" ? "Check-in" : "From"} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="date" value={form.checkInDate} min={tripStart || undefined} max={tripEnd || undefined} onChange={set("checkInDate")} className={inputCls()} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {form.bookingType === "Hotel" ? "Check-out" : "To"} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="date" value={form.checkOutDate} min={form.checkInDate || tripStart || undefined} max={tripEnd || undefined} onChange={set("checkOutDate")} className={inputCls()} />
                </div>
              </div>
            </div>
            {tripStart && tripEnd && (
              <p className="text-xs text-slate-500 -mt-2">Must be within trip ({tripStart} – {tripEnd})</p>
            )}

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Cost (₹) <span className="text-red-400">*</span></label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="number" min="0" step="any" value={form.cost} onChange={set("cost")} placeholder="e.g. 5000" className={inputCls()} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Total amount paid / to be paid</p>
            </div>

            {/* Confirmation Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirmation Number <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <input value={form.confirmationNumber} onChange={set("confirmationNumber")} placeholder="e.g. ABC123XYZ" className={inputCls(false)} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Add Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
