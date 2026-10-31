import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { friendlyError } from "../lib/errors";
import PostCard from "./PostCard";
import { PostListSkeleton } from "./Skeletons";

const PAGE_SIZE = 20;

const SORTS = {
  newest: { label: "Newest", column: "created_at", ascending: false },
  oldest: { label: "Oldest", column: "created_at", ascending: true },
  answers: { label: "Most answers", column: "answer_count", ascending: false },
};

const FILTERS = {
  all: "All questions",
  unanswered: "Unanswered",
  unsolved: "Unsolved",
  solved: "Solved",
};

// Turns the current choices into URL parameters, leaving out the defaults
function buildParams({ category, q, sort, filter }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (filter && filter !== "all") params.set("filter", filter);
  return params;
}

function feedUrl(values) {
  const qs = buildParams(values).toString();
  return qs ? `/?${qs}` : "/";
}

// Builds the database request for one page of results (rows `from` to `to`)
function makeQuery({ category, q, sort, filter, from, to }) {
  const { column, ascending } = SORTS[sort];

  let query = supabase
    .from("posts")
    .select(
      `id, title, body, is_solved, answer_count, created_at,
       category:categories(name, slug),
       author:profiles(username, avatar_url)`,
      // The total only needs counting on the first page
      from === 0 ? { count: "exact" } : undefined,
    )
    .order(column, { ascending });

  // Tie-breakers, so the order is the same between pages
  if (column !== "created_at") {
    query = query.order("created_at", { ascending: false });
  }
  query = query.order("id").range(from, to);

  if (category) query = query.eq("category_id", category.id);
  if (q) {
    query = query.textSearch("search", q, {
      type: "websearch",
      config: "english",
    });
  }
  if (filter === "unanswered") query = query.eq("answer_count", 0);
  if (filter === "solved") query = query.eq("is_solved", true);
  if (filter === "unsolved") query = query.eq("is_solved", false);

  return query;
}

function SearchBox({ initial, onSearch }) {
  const [term, setTerm] = useState(initial);

  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(term.trim());
      }}
    >
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search questions…"
        aria-label="Search questions"
        maxLength={100}
      />
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
}

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get("category") ?? "";
  const q = (searchParams.get("q") ?? "").trim();

  // Ignore unknown values in the URL instead of breaking
  const sortParam = searchParams.get("sort");
  const filterParam = searchParams.get("filter");
  const sort = Object.hasOwn(SORTS, sortParam) ? sortParam : "newest";
  const filter = Object.hasOwn(FILTERS, filterParam) ? filterParam : "all";

  const [categories, setCategories] = useState(null);
  const [result, setResult] = useState({
    key: null,
    posts: [],
    count: 0,
    error: "",
  });
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState({ key: null, message: "" });

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const category = categories?.find((c) => c.slug === slug);
  const waitingForCategories = slug !== "" && categories === null;
  const key = `${category ? category.id : "all"}:${q}:${sort}:${filter}:${attempt}`;

  // Load the first page whenever the category, search, sort or filter changes
  useEffect(() => {
    if (waitingForCategories) return;
    let ignore = false;

    makeQuery({
      category,
      q,
      sort,
      filter,
      from: 0,
      to: PAGE_SIZE - 1,
    }).then(({ data, error, count }) => {
      if (ignore) return;
      setResult({
        key,
        posts: data ?? [],
        count: count ?? 0,
        error: error ? friendlyError(error) : "",
      });
    });

    return () => {
      ignore = true;
    };
  }, [waitingForCategories, category, key, q, sort, filter]);

  const loading = waitingForCategories || result.key !== key;
  const isFiltered = q !== "" || filter !== "all";

  // The line shown under the title, e.g. "500 questions"
  const countText =
    loading || result.error
      ? ""
      : `${result.count} ${result.count === 1 ? "question" : "questions"}`;

  // Change one or more choices and keep the rest
  function update(changes) {
    setSearchParams(
      buildParams({ category: slug, q, sort, filter, ...changes }),
    );
  }

  // Fetch the next page and add it to the end of the list
  async function loadMore() {
    setLoadingMore(true);
    setMoreError({ key, message: "" });

    const from = result.posts.length;
    const { data, error } = await makeQuery({
      category,
      q,
      sort,
      filter,
      from,
      to: from + PAGE_SIZE - 1,
    });
    setLoadingMore(false);

    if (error) {
      setMoreError({ key, message: friendlyError(error) });
      return;
    }

    setResult((current) => {
      // The filters changed while this was loading: drop these rows
      if (current.key !== key) return current;

      // New questions may have shifted the pages, so skip any repeats
      const seen = new Set(current.posts.map((post) => post.id));
      const fresh = data.filter((post) => !seen.has(post.id));
      return { ...current, posts: [...current.posts, ...fresh] };
    });
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>
            {q ? `Results for “${q}”` : category ? category.name : "Questions"}
          </h2>
          <p className="muted feed-count">{countText}</p>
        </div>
        <Link to="/new" className="btn btn-primary">
          Ask a question
        </Link>
      </div>

      <SearchBox
        key={q}
        initial={q}
        onSearch={(value) => update({ q: value })}
      />

      <div className="toolbar">
        <label className="toolbar-field">
          <span>Show</span>
          <select
            value={filter}
            onChange={(e) => update({ filter: e.target.value })}
          >
            {Object.entries(FILTERS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="toolbar-field">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
          >
            {Object.entries(SORTS).map(([value, s]) => (
              <option key={value} value={value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <PostListSkeleton />}

      {!loading && result.error && (
        <div className="card empty">
          <p className="alert alert-error" role="alert">
            {result.error}
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !result.error && result.posts.length === 0 && (
        <div className="card empty">
          <p>
            {isFiltered
              ? "No questions match your search or filter."
              : "No questions here yet."}
          </p>
          <div className="hero-actions">
            {isFiltered && (
              <Link
                to={feedUrl({ category: slug, sort })}
                className="btn btn-ghost"
              >
                Clear search and filter
              </Link>
            )}
            <Link to="/new" className="btn btn-primary">
              {isFiltered ? "Ask it yourself" : "Be the first to ask"}
            </Link>
          </div>
        </div>
      )}

      {!loading && !result.error && result.posts.length > 0 && (
        <>
          <ul className="post-list">
            {result.posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>

          <div className="load-more">
            <p className="muted">
              Showing {result.posts.length} of {result.count}
            </p>
            {result.posts.length < result.count && (
              <button
                className="btn btn-ghost"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
            {moreError.key === key && moreError.message && (
              <p className="alert alert-error" role="alert">
                {moreError.message}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}