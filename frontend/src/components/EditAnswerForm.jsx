import { useState } from "react";
import { supabase } from "../lib/supabase";
import { friendlyError } from "../lib/errors";
import MarkdownField from "./MarkdownField";

const BODY_MIN = 5;
const BODY_MAX = 5000;

export default function EditAnswerForm({ answer, onSaved, onCancel }) {
  const [body, setBody] = useState(answer.body);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = body.trim();
    if (clean.length < BODY_MIN) {
      setError(`Your answer needs at least ${BODY_MIN} characters.`);
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("answers")
      .update({ body: clean })
      .eq("id", answer.id)
      .select("id");
    setSaving(false);

    if (updateError) {
      setError(friendlyError(updateError));
      return;
    }
    if (data.length === 0) {
      setError("Nothing was updated.");
      return;
    }
    onSaved();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <MarkdownField
        label="Edit your answer"
        value={body}
        onChange={setBody}
        maxLength={BODY_MAX}
        required
      />

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
