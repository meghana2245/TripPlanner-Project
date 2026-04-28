import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";
import AdminRoute from "./utils/AdminRoute";
import { useScrollToTop } from "./hooks/useScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TripDetails from "./pages/TripDetails";
import TripHistory from "./pages/TripHistory";
import UserProfile from "./pages/UserProfile";
import DestinationPage from "./pages/DestinationPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function ScrollHandler() {
  useScrollToTop();
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Toaster position="bottom-right" richColors />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/destinations" element={<DestinationPage />} />

          {/* Protected user routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/trip-history" element={<TripHistory />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
