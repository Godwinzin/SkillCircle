import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Brand({ size = 28 }) {
  return (
    <Link to="/" className="brand" aria-label="SkillCircle home">
      <Logo size={size} />
      <span className="brand-name">
        <span className="brand-skill">Skill</span>
        <span className="brand-circle">Circle</span>
      </span>
    </Link>
  );
}