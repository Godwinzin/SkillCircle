import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import { ProfileSkeleton } from "../components/Skeletons";
import RelativeTime from "../components/RelativeTime";
import Avatar from "../components/Avatar";
import { friendlyError } from "../lib/errors";
import { makeExcerpt } from "../lib/text";
import { usePageTitle } from "../hooks/usePageTitle";

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState({ key: null, profile: null, error: "" });
  const [tab, setTab] = useState("questions");

  usePageTitle(result.profile ? `@${result.profile.username}` : "Profile");

  useEffect(() => {
    let ignore = false;

    supabase
      .from("profiles")
      .select(
        `id, username, full_name, bio, level, avatar_url, created_at,
         posts(
           id, title, body, is_solved, answer_count, created_at,
           category:categories(name, slug)
         ),
         answers!author_id(
           id, body, is_accepted, created_at,
           post:posts(id, title)
         )`,
      )
      .eq("username", username.toLowerCase())
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return;
        setResult({
          key: username,
          profile: data,
          error: error?.message ?? "",
        });
      });

    return () => {
      ignore = true;
    };
  }, [username]);

  if (result.key !== username) return <ProfileSkeleton />;

  const { profile } = result;

  if (result.error) {
    return (
      <div className="card empty">
        <p className="alert alert-error" role="alert">
          {friendlyError(result.error)}
        </p>
        <button
          className="btn btn-ghost"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card empty">
        <p>We couldn’t find a member called @{username}.</p>
        <Link to="/" className="btn btn-ghost">
          Back to questions
        </Link>
      </div>
    );
  }

  const posts = [...profile.posts].sort(byNewest);
  const answers = [...profile.answers].sort(byNewest);
  const acceptedCount = answers.filter((a) => a.is_accepted).length;
  const isMe = user?.id === profile.id;

  return (
    <div>
      <section className="card">
        <Avatar
          url={profile.avatar_url}
          name={profile.full_name || profile.username}
          size={96}
        />
        <h1>{profile.full_name}</h1>
        <p className="muted">@{profile.username}</p>
        <p>
          <span className="badge">{profile.level}</span>
        </p>
        {profile.bio && <p className="post-body">{profile.bio}</p>}
        <p className="muted">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </p>

        <ul className="stats">
          <li>
            <strong>{posts.length}</strong>
            <span>Questions</span>
          </li>
          <li>
            <strong>{answers.length}</strong>
            <span>Answers</span>
          </li>
          <li>
            <strong>{acceptedCount}</strong>
            <span>Accepted</span>
          </li>
        </ul>

        {isMe && (
          <div className="actions">
            <Link to="/settings" className="btn btn-ghost">
              Edit profile
            </Link>
          </div>
        )}
      </section>

      <div className="tabs" role="tablist" aria-label="Profile sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "questions"}
          className="tab"
          onClick={() => setTab("questions")}
        >
          Questions ({posts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "answers"}
          className="tab"
          onClick={() => setTab("answers")}
        >
          Answers ({answers.length})
        </button>
      </div>

      {tab === "questions" &&
        (posts.length === 0 ? (
          <p className="muted">No questions yet.</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ))}

      {tab === "answers" &&
        (answers.length === 0 ? (
          <p className="muted">No answers yet.</p>
        ) : (
          <ul className="post-list">
            {answers.map((answer) => (
              <li key={answer.id}>
                <div
                  className={`card answer-card ${answer.is_accepted ? "is-accepted" : ""}`}
                >
                  {answer.is_accepted && (
                    <p>
                      <span className="badge badge-success">
                        ✓ Accepted answer
                      </span>
                    </p>
                  )}
                  <p className="post-body">{makeExcerpt(answer.body)}</p>
                  <div className="post-meta">
                    <span>
                      On{" "}
                      <Link to={`/posts/${answer.post?.id}`}>
                        {answer.post?.title}
                      </Link>
                    </span>
                    <RelativeTime value={answer.created_at} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
