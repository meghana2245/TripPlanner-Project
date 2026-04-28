import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Hotel, Calendar, Star, Plane, Globe, Mail, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

// Intersection observer hook for scroll-triggered animations
function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("animate-fadeIn");
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        observer.unobserve(el);
      }
    }, { threshold: 0.15, ...options });
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const testimonials = [
  { name: "Sarah Mitchell", location: "New York, USA", rating: 5, text: "TripPlanner made organizing my Europe trip so effortless! I had 12 cities, 3 weeks of activities, and hundreds of bookings — all managed in one beautiful dashboard.", avatar: "SM" },
  { name: "Raj Patel", location: "Mumbai, India", rating: 5, text: "I've tried dozens of travel apps but nothing comes close. The itinerary builder is intuitive and the hotel tracking feature saved me so much stress during my Southeast Asia adventure.", avatar: "RP" },
  { name: "Elena Kovacs", location: "Budapest, Hungary", rating: 5, text: "As a solo traveler, safety and organization are everything. TripPlanner keeps all my booking confirmations, emergency contacts, and daily schedules in one place. Absolutely essential.", avatar: "EK" },
];

const features = [
  { icon: Calendar, title: "Smart Itineraries", desc: "Build day-by-day travel plans with drag-and-drop simplicity. Add activities, set reminders, and share with your travel group." },
  { icon: Hotel, title: "Booking Manager", desc: "Track all your hotel, flight, and transport bookings in one dashboard. Never lose a confirmation number again." },
  { icon: MapPin, title: "Destination Explorer", desc: "Discover curated destinations with insider recommendations, must-see spots, and local tips from experienced travelers." },
  { icon: Globe, title: "Trip History", desc: "Relive your adventures with a beautiful timeline of all your past trips, complete with photos and memories." },
  { icon: CheckCircle, title: "Activity Planner", desc: "Schedule activities for each day of your trip with time slots, locations, and notes for a perfectly organized journey." },
  { icon: Star, title: "Personalized Experience", desc: "Get tailored destination suggestions based on your travel style, budget, and past adventures." },
];

export default function Home() {
  usePageTitle("Home");
  const featuresRef = useIntersectionObserver();
  const testimonialsRef = useIntersectionObserver();
  const ctaRef = useIntersectionObserver();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <PageTransition>
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)", filter: "brightness(0.4)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900" />

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-2 rounded-full mb-8">
              <Plane className="w-4 h-4" />✨ Your smart travel companion
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Plan trips that{" "}
              <span style={{ background: "linear-gradient(135deg, #0d9488, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                inspire
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              From weekend getaways to month-long adventures — organize every detail, track every booking, and explore every destination in one beautiful app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/register" className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-teal-500/25 flex items-center gap-2 justify-center">
                Start Planning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/destinations" className="bg-white/10 hover:bg-white/20 active:scale-95 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center gap-2 justify-center">
                <Globe className="w-5 h-5" />Explore Destinations
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              {[["10k+", "Trips Planned"], ["50+", "Destinations"], ["4.9★", "User Rating"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-teal-400">{val}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-teal-400 rounded-full" />
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-6">
          <div ref={featuresRef} className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-teal-400 text-sm font-medium uppercase tracking-widest mb-3">Why TripPlanner?</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything you need to travel smarter</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Powerful features designed to make trip planning effortless and enjoyable</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 hover:border-teal-500/40 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:bg-teal-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 px-6 bg-slate-950/50">
          <div ref={testimonialsRef} className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-teal-400 text-sm font-medium uppercase tracking-widest mb-3">Loved by Travelers</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What our users say</h2>
              <p className="text-slate-400 text-lg">Join thousands of happy travelers worldwide</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ name, location, rating, text, avatar }) => (
                <div key={name} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 hover:border-teal-500/30 transition-colors">
                  <div className="flex gap-1 mb-4">
                    {Array(rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{avatar}</div>
                    <div>
                      <p className="text-white font-semibold text-sm">{name}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div ref={ctaRef} className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-teal-900/40 to-slate-900 border border-teal-500/20 rounded-3xl p-12">
              <div className="text-5xl mb-6">✈️</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to explore the world?</h2>
              <p className="text-slate-400 text-lg mb-8">Join thousands of travelers who plan smarter with TripPlanner</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-teal-500/25">
                  Create Free Account
                </Link>
                <Link to="/login" className="bg-white/10 hover:bg-white/20 active:scale-95 text-white px-8 py-4 rounded-xl font-semibold border border-white/20 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-950 border-t border-slate-800 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xl">
                <Plane className="w-5 h-5" />TripPlanner
              </div>
              <nav className="flex flex-wrap gap-6 text-slate-500 text-sm">
                <Link to="/destinations" className="hover:text-teal-400 transition-colors">Destinations</Link>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-teal-400 transition-colors">Register</Link>
              </nav>
              <div className="flex gap-4">
                {[Globe, Mail, MessageCircle].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm">
              © {new Date().getFullYear()} TripPlanner. Built with ❤️ for travelers everywhere.
            </div>
          </div>
        </footer>
      </PageTransition>
    </div>
  );
}
