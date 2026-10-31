import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { friendlyError } from "../lib/errors";
import RelativeTime from "./RelativeTime";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";

const BODY_MIN = 2;
const BODY_MAX = 500;

export default function Comments({
  comments,
  postId,
  answerId = null,
  onChanged,
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState(null); // comment waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = body.trim();
    if (clean.length < BODY_MIN) {
      setError(`A comment needs at least ${BODY_MIN} characters.`);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("comments")
      .insert({ post_id: postId, answer_id: answerId, body: clean });
    setSubmitting(false);

    if (insertError) {
      setError(friendlyError(insertError));
      return;
    }

    setBody("");
    setOpen(false);
    onChanged();
  }

  async function confirmDelete() {
    if (!pendingId) return;
    setDeleting(true);
    setError("");

    const { data, error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", pendingId)
      .select("id");

    setDeleting(false);
    setPendingId(null);

    if (deleteError) setError(friendlyError(deleteError));
    else if (data.length === 0) setError("Nothing was deleted.");
    else onChanged();
  }

  function cancel() {
    setOpen(false);
    setBody("");
    setError("");
  }

  // Nothing to show: no comments, and visitors can't add any
  if (comments.length === 0 && !user) return null;

  return (
    <div className="comments">
      {comments.length > 0 && (
        <p className="comments-title">Comments ({comments.length})</p>
      )}

      {comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <Avatar
                url={c.author?.avatar_url}
                name={c.author?.username}
                size={32}
              />
              <div className="comment-main">
                <div className="comment-bubble">
                  <div className="comment-head">
                    <Link
                      to={`/u/${c.author?.username}`}
                      className="comment-author"
                    >
                      @{c.author?.username}
                    </Link>
                    <RelativeTime value={c.created_at} />
                  </div>
                  <p className="comment-body">{c.body}</p>
                </div>

                {user?.id === c.author_id && (
                  <button
                    className="link-button comment-delete"
                    onClick={() => setPendingId(c.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {user &&
        (open ? (
          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={BODY_MAX}
              placeholder="Add a comment…"
              aria-label="Add a comment"
              autoFocus
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={cancel}>
              Cancel
            </button>
          </form>
        ) : (
          <button className="link-button" onClick={() => setOpen(true)}>
            Add a comment
          </button>
        ))}

      <ConfirmDialog
        open={pendingId !== null}
        title="Delete this comment?"
        message="This can’t be undone."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingId(null)}
      />
    </div>
  );
}