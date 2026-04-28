import React, { useState, useEffect, useRef } from "react";
import { Globe, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

export default function DestinationModal({ isOpen, onClose, onSuccess, existingDestination }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tagInputRef = useRef(null);

  useEffect(() => {
    if (existingDestination) {
      setName(existingDestination.destinationName || '');
      setDescription(existingDestination.description || '');
      setTags(existingDestination.recommendedPlaces || []);
    } else {
      setName('');
      setDescription('');
      setTags([]);
      setInputValue('');
    }
    setErrors({});
  }, [existingDestination, isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        if (errors.tags) {
          setErrors(prev => ({ ...prev, tags: null }));
        }
      }
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Destination name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (tags.length === 0) newErrors.tags = 'Add at least one recommended place';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const payload = { destinationName: name, description, recommendedPlaces: tags };

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
      console.error("Error saving destination:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* MODAL HEADER */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Globe className="text-teal-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {existingDestination ? "Edit Destination" : "Add Destination"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="text-slate-400 hover:text-white" size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* FIELD 1 — Destination Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Destination Name
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Bali, Indonesia"
                className={`w-full bg-slate-700/50 border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                  errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-600/50 focus:border-teal-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* FIELD 2 — Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-slate-500 size-4" />
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                }}
                placeholder="Describe this destination, what makes it special..."
                rows={4}
                className={`w-full bg-slate-700/50 border rounded-xl pl-10 pr-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                  errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-slate-600/50 focus:border-teal-500'
                }`}
              />
            </div>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* FIELD 3 — Recommended Places */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">Recommended Places</span>
              <span className="text-xs text-slate-500">{tags.length} added</span>
            </div>
            
            <div 
              className={`bg-slate-700/50 border rounded-xl p-3 min-h-[52px] flex flex-wrap gap-2 items-center cursor-text transition-all focus-within:ring-2 focus-within:ring-teal-500/20 ${
                errors.tags ? 'border-red-500/50 focus-within:border-red-500' : 'border-slate-600/50 focus-within:border-teal-500'
              }`}
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full pl-3 pr-1 py-1 text-xs flex items-center gap-1"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                    className="w-4 h-4 rounded-full hover:bg-teal-500/40 flex items-center justify-center transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Type a place, press Enter or comma..." : ""}
                className="bg-transparent border-none outline-none text-white text-sm flex-1 min-w-[140px] py-0.5"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Press Enter or comma to add &middot; Backspace to remove last
            </p>
            {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
          </div>

          {/* MODAL FOOTER */}
          <div className="pt-2">
            <div className="border-t border-white/5 mb-5"></div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl py-3 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin size-4" />
                    {existingDestination ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  existingDestination ? "Save Changes" : "Add Destination"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
