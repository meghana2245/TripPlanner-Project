import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

const memberSince = (id) => {
  try {
    return new Date(parseInt(id.substring(0, 8), 16) * 1000).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return "—"; }
};

function PasswordField({ label, name, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input name={name} type={show ? "text" : "password"} value={value} onChange={onChange}
          placeholder="••••••••"
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function UserProfile() {
  usePageTitle("My Profile");
  const { user, token, login } = useAuth();
  const fileRef = useRef(null);

  const [trips, setTrips] = useState([]);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    try { const res = await api.get("/trips"); setTrips(res.data.data || []); }
    catch { /* silent */ }
  }, []);
  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const now = new Date();
  const upcoming = trips.filter(t => new Date(t.startDate) >= now).length;

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  // ── Profile picture upload ────────────────────────────────────────
  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2 MB");

    setPicLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await api.put("/auth/profile", { profilePicture: base64 });
        login(res.data.data.user, token);
        toast.success("Profile picture updated 🖼️");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update picture");
      } finally { setPicLoading(false); }
    };
    reader.onerror = () => { toast.error("Failed to read file"); setPicLoading(false); };
    reader.readAsDataURL(file);
  };

  // ── Save name ────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return toast.error("Name cannot be empty");
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/profile", { name: profileName.trim() });
      login(res.data.data.user, token);
      toast.success("Profile updated ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setProfileLoading(false); }
  };

  // ── Change password ──────────────────────────────────────────────
  const handlePwChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) return toast.error("All fields required");
    if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords do not match");
    setPwLoading(true);
    try {
      await api.put("/auth/password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully! 🔐");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally { setPwLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <PageTransition>
        {/* Hero */}
        <div className="relative pt-16 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&q=80)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/70 to-slate-900" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
            <p className="text-teal-400 text-sm uppercase tracking-widest font-medium mb-2">Account</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">My Profile</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Avatar + stats */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 text-center sticky top-24">

                {/* Profile Picture */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg shadow-teal-500/20" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                      {initials}
                    </div>
                  )}
                  {/* Camera overlay */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={picLoading}
                    className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                  >
                    {picLoading
                      ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                      : <><Camera className="w-5 h-5 text-white mb-1" /><span className="text-white text-xs font-medium">Change</span></>
                    }
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePicChange}
                  />
                </div>

                <h2 className="text-white font-bold text-2xl mb-1">{user?.name}</h2>
                <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
                <p className="text-slate-600 text-xs mb-6">Member since {user?._id ? memberSince(user._id) : "—"}</p>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Trips", value: trips.length },
                    { label: "Upcoming", value: upcoming },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-4">
                      <p className="text-white font-bold text-xl">{value}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-slate-600 text-xs mt-4 flex items-center justify-center gap-1">
                  <Camera className="w-3 h-3" />Click the photo to change it
                </p>
              </div>
            </div>

            {/* RIGHT — Edit sections */}
            <div className="lg:col-span-2 space-y-6">

              {/* Edit Name */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-5 h-5 text-teal-400" />
                  <h3 className="text-white font-bold text-lg">Edit Profile</h3>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name"
                        className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input value={user?.email || ""} disabled
                        className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm cursor-not-allowed" />
                    </div>
                    <p className="text-slate-600 text-xs mt-1 flex items-center gap-1"><Mail className="w-3 h-3" />Email cannot be changed</p>
                  </div>
                  <button type="submit" disabled={profileLoading}
                    className="bg-teal-600 hover:bg-teal-500 active:scale-95 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                    {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-5 h-5 text-teal-400" />
                  <h3 className="text-white font-bold text-lg">Change Password</h3>
                </div>
                <form onSubmit={handlePwChange} className="space-y-4">
                  <PasswordField label="Current Password" name="currentPassword" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
                  <PasswordField label="New Password" name="newPassword" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
                  <PasswordField label="Confirm New Password" name="confirmPassword" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                  <button type="submit" disabled={pwLoading}
                    className="bg-slate-700 hover:bg-slate-600 active:scale-95 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                    {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}Change Password
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
