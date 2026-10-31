import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { ProfileSkeleton } from "../components/Skeletons";
import AvatarUploader from "../components/AvatarUploader";
import { usePageTitle } from "../hooks/usePageTitle";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

function SettingsForm({ profile, userId }) {
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [level, setLevel] = useState(profile.level);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!USERNAME_PATTERN.test(cleanUsername)) {
      setError(
        "Username must be 3–20 characters: lowercase letters, numbers and underscores only.",
      );
      return;
    }
    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        full_name: cleanName,
        bio: bio.trim() || null,
        level,
      })
      .eq("id", userId)
      .select("id");
    setSaving(false);

    if (updateError) {
      // 23505 is Postgres' code for "unique constraint violated"
      setError(
        updateError.code === "23505"
          ? "That username is already taken."
          : updateError.message,
      );
      return;
    }
    if (data.length === 0) {
      setError("Nothing was updated.");
      return;
    }

    setUsername(cleanUsername);
    setNotice("Profile saved.");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          required
        />
        <span className="field-hint">
          3–20 characters: lowercase letters, numbers and underscores.
        </span>
      </label>

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
        <span>Skill level</span>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          placeholder="What are you learning? What can you help with?"
        />
        <span className="field-hint">{bio.length}/300</span>
      </label>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="alert alert-info">{notice}</p>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export default function Settings() {
  usePageTitle("Settings");
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    supabase
      .from("profiles")
      .select("username, full_name, bio, level, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (ignore) return;
        if (fetchError) setError(fetchError.message);
        else setProfile(data);
      });

    return () => {
      ignore = true;
    };
  }, [user.id]);

  if (error) {
    return (
      <p className="alert alert-error" role="alert">
        {error}
      </p>
    );
  }
  if (!profile) return <ProfileSkeleton />;

  return (
    <div className="auth-card">
      <h1>Profile settings</h1>
      <AvatarUploader
        userId={user.id}
        name={profile.full_name || profile.username}
        initialUrl={profile.avatar_url}
      />
      <SettingsForm profile={profile} userId={user.id} />
    </div>
  );
}
