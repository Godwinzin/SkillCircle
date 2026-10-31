import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // "POP" means Back/Forward: leave the scroll position to the browser
    if (navigationType !== "POP") window.scrollTo(0, 0);
  }, [pathname, search, navigationType]);

  return null; // it draws nothing
}