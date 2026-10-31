import { useState } from "react";
import { supabase } from "../lib/supabase";
import { friendlyError } from "../lib/errors";
import MarkdownField from "./MarkdownField";

const BODY_MIN = 5;
const BODY_MAX = 5000;

export default function AnswerForm({ postId, onPosted }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = body.trim();
    if (clean.length < BODY_MIN) {
      setError(`Your answer needs at least ${BODY_MIN} characters.`);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("answers")
      .insert({ post_id: postId, body: clean });
    setSubmitting(false);

    if (insertError) {
      setError(friendlyError(insertError));
      return;
    }

    setBody("");
    onPosted();
  }

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <MarkdownField
        label="Your answer"
        value={body}
        onChange={setBody}
        maxLength={BODY_MAX}
        placeholder="Explain how you would solve it…"
        required
      />

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Posting…" : "Post answer"}
      </button>
    </form>
  );
}