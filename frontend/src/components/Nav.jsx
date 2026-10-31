import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Nav.css";
import Brand from "./Brand";

export default function Nav({ menuOpen, onMenuClick }) {
  const { user, signOut } = useAuth();

  return (
    <header className="nav" inert={menuOpen}>
      <div className="container nav-inner">
        <div className="nav-left">
          <button
            type="button"
            className="btn btn-ghost nav-menu"
            onClick={onMenuClick}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Brand />
        </div>

        <nav className="nav-links" aria-label="Main">
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="btn btn-ghost" onClick={signOut}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
