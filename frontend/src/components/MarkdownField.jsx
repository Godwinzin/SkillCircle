import { useState } from "react";
import Markdown from "./Markdown";

export default function MarkdownField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  required = false,
}) {
  const [tab, setTab] = useState("write");

  return (
    <div className="field">
      <span>{label}</span>

      <div className="editor-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "write"}
          className="editor-tab"
          onClick={() => setTab("write")}
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          className="editor-tab"
          onClick={() => setTab("preview")}
        >
          Preview
        </button>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={label}
          required={required}
        />
      ) : (
        <div className="editor-preview">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="muted">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <span className="field-hint">
        Markdown supported: <code>**bold**</code>, <code>`code`</code> and
        ``` for code blocks · {value.length}/{maxLength}
      </span>
    </div>
  );
}