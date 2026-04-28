import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Plane, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

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
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: "user",
      });

      const { token, user } = response.data.data;
      login(user, token);

      toast.success("Account created! Welcome aboard 🎉");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
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
              "url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-teal-900/50" />

        {/* Logo top left */}
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
              &ldquo;Every journey begins with a single step&rdquo;
            </blockquote>
            <p className="text-slate-400 text-sm">
              Start planning your dream adventures today with TripPlanner.
            </p>
          </div>
        </div>
      </div>

      {/* Right half — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 text-teal-400 font-bold text-xl mb-8">
            <Plane className="w-5 h-5" />
            TripPlanner
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-slate-400">Join thousands of travelers planning smarter.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full bg-slate-800 border ${
                    errors.name ? "border-red-500" : "border-slate-700"
                  } text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-red-400 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Email */}
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

            {/* Password */}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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



            {/* Terms note */}
            <p className="text-slate-600 text-xs leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-teal-500 hover:text-teal-400 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-teal-500 hover:text-teal-400 underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Login link */}
          <p className="text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
