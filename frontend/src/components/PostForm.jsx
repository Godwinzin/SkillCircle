import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { friendlyError } from "../lib/errors";
import MarkdownField from "./MarkdownField";

const TITLE_MIN = 10;
const TITLE_MAX = 150;
const BODY_MIN = 20;
const BODY_MAX = 10000;

export default function PostForm({
  initial,
  submitLabel,
  submittingLabel,
  onSubmit,
}) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(
    initial?.category_id ? String(initial.category_id) : "",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < TITLE_MIN) {
      setError(`The title needs at least ${TITLE_MIN} characters.`);
      return;
    }
    if (cleanBody.length < BODY_MIN) {
      setError(`The details need at least ${BODY_MIN} characters.`);
      return;
    }

    setSubmitting(true);
    // The parent decides what "save" means and returns an error message, or "" on success
    const message = await onSubmit({
      category_id: Number(categoryId),
      title: cleanTitle,
      body: cleanBody,
    });
    setSubmitting(false);
    if (message) setError(friendlyError(message));
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Category</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="e.g. Why does my flex container overflow on mobile?"
          required
        />
        <span className="field-hint">
          {title.length}/{TITLE_MAX}
        </span>
      </label>

      <MarkdownField
        label="Details"
        value={body}
        onChange={setBody}
        maxLength={BODY_MAX}
        placeholder="What have you tried? What did you expect to happen?"
        required
      />

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}