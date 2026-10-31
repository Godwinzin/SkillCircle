import { Link } from "react-router-dom";
import { useNow } from "../hooks/useNow";
import Brand from "./Brand";

// Give a link a `to` (page in this app) or an `href` (outside site) when it exists.
// Until then it does nothing.
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "About SkillCircle", to: null },
      { label: "How it works", to: null },
      { label: "Help center & FAQ", to: null },
      { label: "Changelog", to: null },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Community guidelines", to: null },
      { label: "Code of conduct", to: null },
      { label: "Report a problem", to: null },
      { label: "Feedback & ideas", to: null },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", to: null },
      { label: "Terms of use", to: null },
      { label: "Cookie policy", to: null },
      { label: "Data protection requests", to: null },
      { label: "Accessibility", to: null },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact us", to: null },
      { label: "GitHub", href: null },
      { label: "X (Twitter)", href: null },
      { label: "LinkedIn", href: null },
      { label: "Discord", href: null },
    ],
  },
];

function FooterLink({ label, to, href }) {
  if (to) return <Link to={to}>{label}</Link>;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  // Placeholder: looks like a link, goes nowhere
  return (
    <a href="#" title="Coming soon" onClick={(e) => e.preventDefault()}>
      {label}
    </a>
  );
}

export default function Footer({ menuOpen = false }) {
  const now = useNow();
  const year = new Date(now).getFullYear();

  return (
    <footer className="footer" inert={menuOpen}>
      <div className="container footer-inner">
        <div className="footer-brand">
          <Brand />
          <p className="muted">
            A community where learners ask, answer and grow together.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="footer-title">{column.title}</h2>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container footer-bottom">
        <span>© {year} SkillCircle. All rights reserved.</span>
        <span>Made for learners, by learners.</span>
      </div>
    </footer>
  );
}
