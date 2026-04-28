import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Plane, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data.data;
      login(user, token);

      toast.success(`Welcome back, ${user.name}! 🌍`);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left half — travel image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-teal-900/50" />

        {/* Decorative elements */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2 text-teal-400 font-bold text-xl">
            <Plane className="w-5 h-5" />
            TripPlanner
          </Link>
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-lg">★</span>
              ))}
            </div>
            <blockquote className="text-white text-xl font-semibold leading-relaxed mb-5">
              &ldquo;The world is yours to explore&rdquo;
            </blockquote>
            <p className="text-slate-400 text-sm">
              Join thousands of travelers who plan smarter trips with TripPlanner.
            </p>
          </div>
        </div>
      </div>

      {/* Right half — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 text-teal-400 font-bold text-xl mb-8">
            <Plane className="w-5 h-5" />
            TripPlanner
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to continue planning your adventures.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full bg-slate-800 border ${
                    errors.email ? "border-red-500" : "border-slate-700"
                  } text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-800 border ${
                    errors.password ? "border-red-500" : "border-slate-700"
                  } text-white placeholder-slate-500 rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-400 text-xs">{errors.password}</p>
              )}
            </div>



            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Register link */}
          <p className="text-center text-slate-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
