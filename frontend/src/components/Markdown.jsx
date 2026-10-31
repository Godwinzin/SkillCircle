import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

const COLLAPSE_AFTER = 15; // lines

// Pulls the plain text out of the (colored) code elements, to count lines
function textOf(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node?.props?.children) return textOf(node.props.children);
  return "";
}

function CodeBlock({ children }) {
  const [expanded, setExpanded] = useState(false);
  const lines = textOf(children).trimEnd().split("\n").length;
  const long = lines > COLLAPSE_AFTER;

  return (
    <div className={`code-block ${long ? "has-toggle" : ""}`}>
      <pre className={long && !expanded ? "is-collapsed" : ""}>{children}</pre>
      {long && (
        <button
          type="button"
          className="code-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : `Show all ${lines} lines`}
        </button>
      )}
    </div>
  );
}

const components = {
  // Links from members open in a new tab and don't help spam rankings
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          [
            rehypeHighlight,
            {
              aliases: {
                javascript: ["javascriptreact"],
                typescript: ["typescriptreact"],
              },
            },
          ],
        ]}
        disallowedElements={["img"]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}