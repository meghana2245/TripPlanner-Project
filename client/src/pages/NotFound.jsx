import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("404 Not Found");

  return (
    <div className="min-h-screen relative flex flex-col">
      <Navbar />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)" }}
      />
      <div className="absolute inset-0 bg-slate-900/85" />

      <PageTransition>
        <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center px-6">
            {/* Floating plane */}
            <div className="text-6xl mb-6 animate-float inline-block">✈️</div>

            {/* 404 */}
            <h1
              className="text-[120px] md:text-[160px] font-black leading-none mb-4"
              style={{ background: "linear-gradient(135deg, #0d9488, #14b8a6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              404
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Lost in the world?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              Looks like this destination doesn't exist on our map.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-medium transition-all"
              >
                Take Me Home
              </Link>
              <Link
                to="/dashboard"
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white px-8 py-3.5 rounded-xl font-medium border border-white/20 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
