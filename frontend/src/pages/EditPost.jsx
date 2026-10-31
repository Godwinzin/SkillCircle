import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import PostForm from "../components/PostForm";
import { friendlyError } from "../lib/errors";
import { usePageTitle } from "../hooks/usePageTitle";

export default function EditPost() {
  usePageTitle("Edit question");
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState({ key: null, post: null, error: "" });

  useEffect(() => {
    let ignore = false;

    supabase
      .from("posts")
      .select("id, title, body, category_id, author_id")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return;
        setResult({ key: id, post: data, error: error?.message ?? "" });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (result.key !== id) return <p className="muted">Loading…</p>;

  const post = result.post;

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

  if (!post) {
    return (
      <div className="card empty">
        <p>We couldn’t find that question.</p>
        <Link to="/" className="btn btn-ghost">
          Back to questions
        </Link>
      </div>
    );
  }

  if (post.author_id !== user.id) {
    return (
      <p className="alert alert-error" role="alert">
        You can only edit your own questions.
      </p>
    );
  }

  async function handleUpdate(values) {
    const { data, error } = await supabase
      .from("posts")
      .update(values)
      .eq("id", id)
      .select("id");

    if (error) return error.message;
    if (data.length === 0) return "Nothing was updated.";
    navigate(`/posts/${id}`);
    return "";
  }

  return (
    <div className="auth-card">
      <h1>Edit question</h1>
      <PostForm
        initial={post}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
