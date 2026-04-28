import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} | TripPlanner`;
    return () => { document.title = "TripPlanner"; };
  }, [title]);
}
