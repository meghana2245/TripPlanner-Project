import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Calendar, Tag, Users, IndianRupee, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];

const Field = ({ label, icon: Icon, required, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">
      {label}
      {!required && <span className="text-slate-500 text-xs ml-1">(optional)</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />}
      {children}
    </div>
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

const inputCls = (hasIcon = true) =>
  `w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`;

/**
 * Safe date arithmetic that avoids JS timezone offset bugs.
 * Parses "YYYY-MM-DD" as LOCAL date parts (not UTC), adds `days`, returns "YYYY-MM-DD".
 */
const addDaysLocal = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days); // local constructor — no UTC offset
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

export default function TripModal({ isOpen, onClose, onSuccess, existingTrip, preDestination = "", preDestinationId = "" }) {
  const isEdit = !!existingTrip;
  const [form, setForm] = useState({
    tripName: "",
    destination: preDestination || "",
    startDate: today(),
    endDate: "",
    budget: "",
    numberOfPeople: "",
  });
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState(""); // progress text

  useEffect(() => {
    if (existingTrip) {
      setForm({
        tripName: existingTrip.tripName || "",
        destination: existingTrip.destination || "",
        startDate: existingTrip.startDate ? existingTrip.startDate.split("T")[0] : today(),
        endDate: existingTrip.endDate ? existingTrip.endDate.split("T")[0] : "",
        budget: existingTrip.budget !== undefined ? String(existingTrip.budget) : "",
        numberOfPeople: existingTrip.numberOfPeople !== undefined ? String(existingTrip.numberOfPeople) : "",
      });
    } else {
      setForm({ tripName: "", destination: preDestination || "", startDate: today(), endDate: "", budget: "", numberOfPeople: "" });
    }
  }, [existingTrip, isOpen, preDestination]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // ── Auto-seed activities from destination's sample itinerary ──────────
  const seedItineraryActivities = async (tripId, tripStartDate, destId) => {
    try {
      setSeedStatus("Fetching itinerary…");
      const destRes = await api.get(`/destinations/${destId}`);
      const dest = destRes.data?.data;

      if (!dest) {
        console.warn("[Seed] Destination not found for id:", destId);
        return 0;
      }

      const itinerary = dest.sampleItinerary || [];
      if (itinerary.length === 0) {
        console.info("[Seed] No sample itinerary found for destination:", dest.destinationName);
        return 0;
      }

      // Build all activity payloads
      const payloads = [];
      const sorted = [...itinerary].sort((a, b) => a.day - b.day);

      sorted.forEach((dayItem) => {
        const activityDate = addDaysLocal(tripStartDate, dayItem.day - 1);
        const fallbackPlace = dest.destinationName || "Unknown Place";
        const placeName = dayItem.title?.trim() || fallbackPlace;

        const activitiesForDay = (dayItem.activities || []).map((a) => a.trim()).filter(Boolean);

        if (activitiesForDay.length > 0) {
          activitiesForDay.forEach((actName) => {
            payloads.push({
              tripId,
              activityName: actName,
              placeName,
              activityDate,
              notes: `Day ${dayItem.day}${dayItem.title ? ` — ${dayItem.title}` : ""} (from sample itinerary)`,
              cost: 0,
            });
          });
        } else if (dayItem.title?.trim()) {
          // Fallback: If admin just wrote a title but didn't add bullet points
          payloads.push({
            tripId,
            activityName: dayItem.title.trim(),
            placeName: fallbackPlace,
            activityDate,
            notes: `Day ${dayItem.day} (from sample itinerary)`,
            cost: 0,
          });
        }
      });

      if (payloads.length === 0) {
        console.info("[Seed] Itinerary found but all activity entries were empty");
        return 0;
      }

      setSeedStatus(`Adding ${payloads.length} activities…`);

      // Use allSettled so partial failures don't kill the whole batch
      const results = await Promise.allSettled(
        payloads.map((p) => api.post("/activities", p))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        const sampleErr = results.find((r) => r.status === "rejected")?.reason;
        console.error("[Seed] Some activities failed:", sampleErr?.response?.data || sampleErr?.message);
        toast.warning(`${succeeded} activities added; ${failed} failed`);
      }

      return succeeded;
    } catch (err) {
      console.error("[Seed] Failed to fetch destination or create activities:", err?.response?.data || err?.message);
      return 0;
    } finally {
      setSeedStatus("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tripName.trim() || !form.destination.trim()) {
      return toast.error("Trip name and destination are required");
    }
    if (!form.endDate) return toast.error("Please set an end date");
    if (form.endDate < form.startDate) return toast.error("End date must be after start date");
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0) {
      return toast.error("Please enter a valid budget amount");
    }
    if (!form.numberOfPeople || isNaN(Number(form.numberOfPeople)) || Number(form.numberOfPeople) < 1) {
      return toast.error("Please enter the number of people (minimum 1)");
    }

    setLoading(true);
    const payload = {
      ...form,
      budget: Number(form.budget),
      numberOfPeople: Number(form.numberOfPeople),
    };

    try {
      if (isEdit) {
        await api.put(`/trips/${existingTrip._id}`, payload);
        toast.success("Trip updated! ✈");
      } else {
        const res = await api.post("/trips", payload);
        const newTrip = res.data?.data;
        const newTripId = newTrip?._id;

        if (!newTripId) {
          throw new Error("Trip created but no ID returned from server");
        }

        // Seed itinerary activities if coming from a destination
        if (preDestinationId) {
          setLoading(false);
          setSeeding(true);
          const count = await seedItineraryActivities(newTripId, form.startDate, preDestinationId);
          setSeeding(false);
          if (count > 0) {
            toast.success(`Trip created! ${count} activities added from itinerary 🗓️`);
          } else {
            toast.success("Trip created! 🌍 (No itinerary activities found)");
          }
        } else {
          toast.success("Trip created! 🌍");
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setSeeding(false);
      setSeedStatus("");
      console.error("[TripModal] Submit error:", err?.response?.data || err?.message);
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || seeding;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Trip" : "Create New Trip"}</h2>
              {!isEdit && preDestinationId && (
                <p className="text-teal-400 text-xs mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Itinerary will be auto-added
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Trip Name" icon={Tag} required>
              <input value={form.tripName} onChange={set("tripName")} placeholder="e.g. Goa Trip 2026" className={inputCls()} />
            </Field>

            <Field label="Destination" icon={MapPin} required>
              <input value={form.destination} onChange={set("destination")} placeholder="e.g. Goa, India" className={inputCls()} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" icon={Calendar} required>
                <input type="date" value={form.startDate} onChange={set("startDate")} className={inputCls()} />
              </Field>
              <Field label="End Date" icon={Calendar} required>
                <input type="date" value={form.endDate} min={form.startDate} onChange={set("endDate")} className={inputCls()} />
              </Field>
            </div>

            <Field label="Total Budget" icon={IndianRupee} required hint="Estimated total spend for this trip">
              <input type="number" min="0" step="any" value={form.budget} onChange={set("budget")} placeholder="e.g. 50000" className={inputCls()} />
            </Field>

            <Field label="Number of People" icon={Users} required hint="Including yourself">
              <input type="number" min="1" step="1" value={form.numberOfPeople} onChange={set("numberOfPeople")} placeholder="e.g. 2" className={inputCls()} />
            </Field>

            {/* Seeding progress */}
            {seeding && (
              <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
                <p className="text-teal-300 text-sm">{seedStatus || "Adding itinerary activities…"}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={isBusy} className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isBusy} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                {seeding ? seedStatus || "Adding activities…" : isEdit ? "Save Changes" : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
