import { useState } from "react";
import { Plane, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function UpcomingTripBanner({ trips = [] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcoming = trips
    .filter((t) => {
      const start = new Date(t.startDate);
      return start >= now && start <= in7Days;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  if (upcoming.length === 0) return null;

  const soonest = upcoming[0];
  const daysLeft = Math.ceil((new Date(soonest.startDate) - now) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="overflow-hidden"
      style={{ animation: "slideDown 400ms ease-out forwards" }}
    >
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Plane className="w-5 h-5 text-white shrink-0 animate-pulse" />
          <p className="text-white font-medium text-sm truncate">
            Your trip to{" "}
            <Link to={`/trips/${soonest._id}`} className="font-bold underline underline-offset-2 hover:text-teal-100 transition-colors">
              {soonest.destination}
            </Link>{" "}
            starts in{" "}
            <span className="font-bold">{daysLeft === 0 ? "today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}</span>! 🧳
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-teal-100 hover:text-white transition-colors active:scale-95"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
