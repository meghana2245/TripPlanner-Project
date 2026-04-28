import { LayoutDashboard, Globe, Briefcase, BarChart2, LogOut, Plane, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "destinations", label: "Destinations", icon: Globe },
  { id: "trips", label: "All Trips", icon: Briefcase },
  { id: "reports", label: "Reports", icon: BarChart2 },
];

export default function AdminSidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("See you soon! 👋");
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-lg">
            <Plane className="w-5 h-5" />
            <span>TripPlanner <span className="text-slate-500 text-xs font-normal">Admin</span></span>
          </div>
          {mobileOpen !== undefined && (
            <button className="lg:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-slate-600 text-xs uppercase tracking-widest px-3 mb-3">Navigation</p>
        {ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setMobileOpen && setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-950 border-r border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 animate-slideUp">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
