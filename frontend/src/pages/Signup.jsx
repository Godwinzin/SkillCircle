import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import SocialButtons from "../components/SocialButtons";

export default function Signup() {
  usePageTitle("Sign up");
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const { data, error: authError } = await signUp(
      email,
      password,
      fullName.trim(),
    );
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // A session exists when email confirmation is off
    if (data.session) {
      navigate("/", { replace: true });
    } else {
      setNotice(
        "Account created. Check your email to confirm it, then log in.",
      );
    }
  }

  return (
    <div className="auth-card">
      <h1>Join SkillCircle</h1>
      <p className="muted">Create a free account in under a minute.</p>
      <SocialButtons redirectPath="/" onError={setError} />
      <div className="divider">
        <span>or sign up with your email</span>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={60}
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="alert alert-info">{notice}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="auth-footer muted">
        Already a member? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
