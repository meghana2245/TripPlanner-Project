import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Calendar, Tag, FileText, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const inputCls = (hasIcon = true) =>
  `w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`;

export default function ActivityModal({ isOpen, onClose, onSuccess, tripId, trip, existingActivity }) {
  const isEdit = !!existingActivity;
  const tripStart = trip?.startDate ? trip.startDate.split("T")[0] : "";
  const tripEnd   = trip?.endDate   ? trip.endDate.split("T")[0]   : "";

  const [form, setForm] = useState({
    activityName: "", placeName: "", activityDate: tripStart || "", notes: "", cost: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingActivity) {
      setForm({
        activityName: existingActivity.activityName || "",
        placeName: existingActivity.placeName || "",
        activityDate: existingActivity.activityDate ? existingActivity.activityDate.split("T")[0] : tripStart,
        notes: existingActivity.notes || "",
        cost: existingActivity.cost !== undefined ? String(existingActivity.cost) : "",
      });
    } else {
      setForm({ activityName: "", placeName: "", activityDate: tripStart || "", notes: "", cost: "" });
    }
  }, [existingActivity, isOpen, tripStart]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.activityName.trim()) return toast.error("Activity name is required");
    if (!form.placeName.trim()) return toast.error("Place name is required");
    if (!form.activityDate) return toast.error("Please select a date");
    setLoading(true);
    const payload = { ...form, cost: Number(form.cost) || 0 };
    try {
      if (isEdit) {
        await api.put(`/activities/${existingActivity._id}`, payload);
        toast.success("Activity updated! ✏️");
      } else {
        await api.post("/activities", { ...payload, tripId });
        toast.success("Activity added! 🎯");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save activity");
    } finally {
      setLoading(false);
    }
  };

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
              <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Activity" : "Add Activity"}</h2>
              {trip && <p className="text-slate-500 text-xs mt-0.5">Trip: {tripStart} → {tripEnd}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Activity Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Activity Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.activityName} onChange={set("activityName")} placeholder="e.g. Visit Eiffel Tower" className={inputCls()} />
              </div>
            </div>

            {/* Place Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Place You're Visiting <span className="text-red-400">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.placeName} onChange={set("placeName")} placeholder="e.g. Eiffel Tower, Champ de Mars" className={inputCls()} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Specific place or landmark you'll be at</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date <span className="text-red-400">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={form.activityDate}
                  min={tripStart || undefined}
                  max={tripEnd || undefined}
                  onChange={set("activityDate")}
                  className={inputCls()}
                />
              </div>
              {tripStart && tripEnd && (
                <p className="text-xs text-slate-500 mt-1">Within trip dates ({tripStart} – {tripEnd})</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Activity Cost (₹) <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.cost}
                  onChange={set("cost")}
                  placeholder="e.g. 500"
                  className={inputCls()}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Helps track actual vs estimated budget</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Notes <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Any notes, tips, booking info..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Add Activity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
