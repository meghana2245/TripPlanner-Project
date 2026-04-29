import React, { useState, useEffect, useRef } from "react";
import { Globe, X, FileText, Loader2, Zap, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const TagInput = ({ tags, onAdd, onRemove, inputValue, setInputValue, inputRef, placeholder, chipClass, focusClass }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, "");
      if (val && !tags.includes(val)) onAdd(val);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  };
  return (
    <div
      className={`bg-slate-700/50 border border-slate-600/50 rounded-xl p-3 min-h-[52px] flex flex-wrap gap-2 items-center cursor-text transition-all ${focusClass}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={i} className={`rounded-full pl-3 pr-1 py-1 text-xs flex items-center gap-1 ${chipClass}`}>
          {tag}
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(i); }} className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="bg-transparent border-none outline-none text-white text-sm flex-1 min-w-[140px] py-0.5"
      />
    </div>
  );
};

export default function DestinationModal({ isOpen, onClose, onSuccess, existingDestination }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [activityTags, setActivityTags] = useState([]);
  const [activityInput, setActivityInput] = useState("");
  // Sample Itinerary
  const [itinerary, setItinerary] = useState([]);
  const [activeTab, setActiveTab] = useState("basic"); // "basic" | "itinerary"
  const [expandedDays, setExpandedDays] = useState({});

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tagInputRef = useRef(null);
  const activityInputRef = useRef(null);

  useEffect(() => {
    if (existingDestination) {
      setName(existingDestination.destinationName || "");
      setDescription(existingDestination.description || "");
      setTags(existingDestination.recommendedPlaces || []);
      setActivityTags(existingDestination.destinationActivities || []);
      const itin = existingDestination.sampleItinerary || [];
      setItinerary(itin.map((d) => ({ ...d, activities: d.activities || [] })));
      const exp = {};
      itin.forEach((d) => { exp[d.day] = true; });
      setExpandedDays(exp);
    } else {
      setName(""); setDescription(""); setTags([]); setInputValue("");
      setActivityTags([]); setActivityInput(""); setItinerary([]);
      setExpandedDays({}); setActiveTab("basic");
    }
    setErrors({});
  }, [existingDestination, isOpen]);

  if (!isOpen) return null;

  // ── Itinerary helpers ─────────────────────────────────────────────
  const addDay = () => {
    const nextDay = itinerary.length > 0 ? Math.max(...itinerary.map((d) => d.day)) + 1 : 1;
    const newDay = { day: nextDay, title: "", activities: [] };
    setItinerary([...itinerary, newDay]);
    setExpandedDays((p) => ({ ...p, [nextDay]: true }));
  };

  const updateDay = (day, field, value) =>
    setItinerary((p) => p.map((d) => d.day === day ? { ...d, [field]: value } : d));

  const removeDay = (day) =>
    setItinerary((p) => p.filter((d) => d.day !== day));

  const addActivity = (day) => {
    setItinerary((p) =>
      p.map((d) =>
        d.day === day ? { ...d, activities: [...d.activities, ""] } : d
      )
    );
  };

  const updateActivity = (day, idx, value) =>
    setItinerary((p) =>
      p.map((d) =>
        d.day === day ? { ...d, activities: d.activities.map((a, i) => i === idx ? value : a) } : d
      )
    );

  const removeActivity = (day, idx) =>
    setItinerary((p) =>
      p.map((d) =>
        d.day === day ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d
      )
    );

  const toggleDay = (day) => setExpandedDays((p) => ({ ...p, [day]: !p[day] }));

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Destination name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (tags.length === 0) newErrors.tags = "Add at least one recommended place";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setActiveTab("basic"); return; }

    setLoading(true);
    const cleanItinerary = itinerary
      .map((d) => ({ day: d.day, title: d.title || "", activities: d.activities.filter((a) => a.trim()) }))
      .filter((d) => d.activities.length > 0 || d.title);

    const payload = {
      destinationName: name, description,
      recommendedPlaces: tags,
      destinationActivities: activityTags,
      sampleItinerary: cleanItinerary,
    };
    try {
      if (existingDestination) {
        await api.put(`/destinations/${existingDestination._id}`, payload);
        toast.success("Destination updated! ✈️");
      } else {
        await api.post("/destinations", payload);
        toast.success("Destination added! 🌍");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sortedItinerary = [...itinerary].sort((a, b) => a.day - b.day);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="flex min-h-full items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg animate-slideUp">
          {/* Header */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Globe className="text-teal-400" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">
                {existingDestination ? "Edit Destination" : "Add Destination"}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <X className="text-slate-400 hover:text-white" size={18} />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-white/10 mx-6 mt-5">
            {[
              { key: "basic", label: "Details" },
              { key: "itinerary", label: `Sample Itinerary${itinerary.length > 0 ? ` (${itinerary.length}d)` : ""}` },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === key ? "text-teal-400 border-teal-500" : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── BASIC TAB ───────────────────────────────── */}
            {activeTab === "basic" && (
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Destination Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: null })); }}
                      placeholder="e.g. Bali, Indonesia"
                      className={`w-full bg-slate-700/50 border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${errors.name ? "border-red-500/50" : "border-slate-600/50 focus:border-teal-500"}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 text-slate-500 size-4" />
                    <textarea
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors((p) => ({ ...p, description: null })); }}
                      placeholder="Describe this destination..."
                      rows={3}
                      className={`w-full bg-slate-700/50 border rounded-xl pl-10 pr-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${errors.description ? "border-red-500/50" : "border-slate-600/50 focus:border-teal-500"}`}
                    />
                  </div>
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Recommended Places */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Recommended Places</span>
                    <span className="text-xs text-slate-500">{tags.length} added</span>
                  </div>
                  <TagInput
                    tags={tags} inputValue={inputValue} setInputValue={setInputValue}
                    inputRef={tagInputRef} placeholder="Type a place, press Enter..."
                    onAdd={(v) => setTags([...tags, v])} onRemove={(i) => setTags(tags.filter((_, j) => j !== i))}
                    chipClass="bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    focusClass="focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20"
                  />
                  {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
                  <p className="text-xs text-slate-500 mt-1.5">Press Enter or comma to add · Backspace to remove last</p>
                </div>

                {/* Suggested Activities */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Suggested Activities <span className="text-slate-500 text-xs">(optional)</span></span>
                    <span className="text-xs text-slate-500">{activityTags.length} added</span>
                  </div>
                  <TagInput
                    tags={activityTags} inputValue={activityInput} setInputValue={setActivityInput}
                    inputRef={activityInputRef} placeholder="e.g. Scuba Diving, Sunset Cruise..."
                    onAdd={(v) => setActivityTags([...activityTags, v])} onRemove={(i) => setActivityTags(activityTags.filter((_, j) => j !== i))}
                    chipClass="bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    focusClass="focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Shown as activity suggestions on the destination page</p>
                </div>
              </div>
            )}

            {/* ── ITINERARY TAB ──────────────────────────── */}
            {activeTab === "itinerary" && (
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Day-by-Day Plan</p>
                    <p className="text-slate-500 text-xs mt-0.5">Users can view and use this as a template</p>
                  </div>
                  <button
                    type="button"
                    onClick={addDay}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                </div>

                {sortedItinerary.length === 0 ? (
                  <div className="text-center py-10 bg-slate-700/30 border border-white/5 border-dashed rounded-xl">
                    <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No itinerary days yet</p>
                    <p className="text-slate-600 text-xs mt-1">Click "Add Day" to start building</p>
                  </div>
                ) : (
                  sortedItinerary.map((item) => (
                    <div key={item.day} className="bg-slate-700/40 border border-white/8 rounded-xl overflow-hidden">
                      {/* Day header */}
                      <div className="flex items-center gap-3 p-4">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                          <span className="text-teal-400 font-bold text-xs">{item.day}</span>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateDay(item.day, "title", e.target.value)}
                          placeholder={`Day ${item.day} title (e.g. Arrival & City Tour)`}
                          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-600"
                        />
                        <div className="flex gap-1">
                          <button type="button" onClick={() => toggleDay(item.day)} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors">
                            {expandedDays[item.day] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button type="button" onClick={() => removeDay(item.day)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Activities for this day */}
                      {expandedDays[item.day] && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                          {item.activities.map((act, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <input
                                type="text"
                                value={act}
                                onChange={(e) => updateActivity(item.day, idx, e.target.value)}
                                placeholder="e.g. Visit Uluwatu Temple"
                                className="flex-1 bg-slate-800/60 border border-white/8 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 placeholder-slate-600"
                              />
                              <button type="button" onClick={() => removeActivity(item.day, idx)} className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addActivity(item.day)}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-teal-400 text-xs mt-1 transition-colors"
                          >
                            <Plus size={12} /> Add activity
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-white/5 flex gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl py-3 text-sm font-medium transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin size-4" />{existingDestination ? "Saving..." : "Adding..."}</> : (existingDestination ? "Save Changes" : "Add Destination")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
