import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, User, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const inputCls = "w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all";

function PwField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          placeholder="••••••••"
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "A";

  // Edit profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    if (!email.trim()) return toast.error("Email cannot be empty");
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/profile", { name: name.trim(), email: email.trim() });
      login(res.data.data.user, token);
      toast.success("Profile updated ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setProfileLoading(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.new || !pw.confirm) return toast.error("All fields required");
    if (pw.new.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw.new !== pw.confirm) return toast.error("Passwords do not match");
    setPwLoading(true);
    try {
      await api.put("/auth/password", { currentPassword: pw.current, newPassword: pw.new });
      toast.success("Password changed 🔐");
      setPw({ current: "", new: "", confirm: "" });
      setPwDone(true);
      setTimeout(() => setPwDone(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setPwLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-14 bg-slate-900/95 backdrop-blur border-b border-white/10 z-40 flex items-center px-6 gap-3">
        <button onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Back to Dashboard
        </button>
        <span className="text-slate-700 select-none">|</span>
        <span className="text-white text-sm font-medium">My Profile</span>
      </header>

      <div className="pt-24 pb-16 max-w-lg mx-auto px-6">

        {/* Avatar card */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-900/40">
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Administrator
          </span>
        </div>

        {/* Profile form */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 mb-5">
          <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" />Account Details
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" className={inputCls} />
              </div>
            </div>
            <button type="submit" disabled={profileLoading}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />Change Password
            </h2>
            {pwDone && (
              <span className="flex items-center gap-1 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />Updated
              </span>
            )}
          </div>
          <form onSubmit={handlePwSave} className="space-y-4">
            <PwField label="Current Password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
            <PwField label="New Password" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} />
            <PwField label="Confirm New Password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Change Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
