import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Brand from "./Brand";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const closeRef = useRef(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  // When the drawer opens, move the keyboard focus into it
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Which sidebar link matches the page you're on?
  const onFeed = pathname === "/";
  const activeCategory = searchParams.get("category") ?? "";
  const activeFilter = searchParams.get("filter") ?? "";

  const linkClass = (active) => `sidebar-link ${active ? "is-active" : ""}`;

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Sidebar"
        // Tapping any link inside closes the drawer
        onClick={(e) => {
          if (e.target.closest("a")) onClose();
        }}
      >
        <div className="drawer-header">
          <Brand />
          <button
            type="button"
            ref={closeRef}
            className="btn btn-ghost drawer-close"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav className="sidebar-section" aria-label="Browse">
          <h2 className="sidebar-title">Browse</h2>
          <ul className="sidebar-list">
            <li>
              <Link
                to="/"
                className={linkClass(
                  onFeed && !activeCategory && !activeFilter,
                )}
              >
                All questions
              </Link>
            </li>
            <li>
              <Link
                to="/?filter=unanswered"
                className={linkClass(
                  onFeed && !activeCategory && activeFilter === "unanswered",
                )}
              >
                Unanswered
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="sidebar-section" aria-label="Categories">
          <h2 className="sidebar-title">Categories</h2>
          <ul className="sidebar-list">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/?category=${c.slug}`}
                  className={linkClass(onFeed && activeCategory === c.slug)}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="sidebar-section" aria-label="Your account">
          <h2 className="sidebar-title">{user ? "You" : "Join"}</h2>
          <ul className="sidebar-list">
            {user ? (
              <>
                <li>
                  <Link to="/new" className={linkClass(pathname === "/new")}>
                    Ask a question
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className={linkClass(pathname.startsWith("/u/"))}
                  >
                    Your profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className={linkClass(pathname === "/settings")}
                  >
                    Settings
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className={linkClass(pathname === "/login")}
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className={linkClass(pathname === "/signup")}
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
