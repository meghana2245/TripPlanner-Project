import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, LogOut, Menu, X, ChevronDown, Clock, Globe, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("See you soon! 👋");
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-teal-400 font-bold text-xl">
            <Plane className="w-5 h-5" />TripPlanner
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/destinations" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1">
              <Globe className="w-4 h-4" />Destinations
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
                <Link to="/trip-history" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1">
                  <Clock className="w-4 h-4" />History
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="text-amber-400 hover:text-amber-300 text-sm transition-colors flex items-center gap-1 font-medium">
                    <Shield className="w-4 h-4" />Admin Panel
                  </Link>
                )}
              </>
            )}

            {user ? (
              /* Avatar dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full pl-1 pr-3 py-1 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-white text-sm">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-slate-700 text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
                <Link to="/register" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-slate-900 border-l border-slate-800 flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-teal-400 font-bold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {user && (
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{user?.name}</p>
                  <p className="text-slate-500 text-xs">{user?.email}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1 flex-1">
              <Link to="/destinations" onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />Destinations
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">Dashboard</Link>
                  <Link to="/trip-history" onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />Trip History
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-amber-400 hover:text-amber-300 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm flex items-center gap-2 font-medium">
                      <Shield className="w-4 h-4" />Admin Panel
                    </Link>
                  )}
                </>
              )}
              {!user && (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm">Register</Link>
                </>
              )}
            </nav>

            {user && (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2.5 text-sm mt-4 border-t border-slate-800 pt-4"
              >
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
