import { Link } from "react-router-dom";
import RelativeTime from "./RelativeTime";
import Avatar from "./Avatar";
import { makeExcerpt } from "../lib/text";

export default function PostCard({ post }) {
  const excerpt = makeExcerpt(post.body);

  return (
    <article className="card post-card">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className="muted">{excerpt}</p>
      <div className="post-meta">
        <span className="badge">{post.category?.name}</span>
        {post.is_solved && <span className="badge badge-success">Solved</span>}
        <span>
          {post.answer_count} {post.answer_count === 1 ? "answer" : "answers"}
        </span>
        {post.author && (
          <Link to={`/u/${post.author.username}`} className="author">
            <Avatar
              url={post.author.avatar_url}
              name={post.author.username}
              size={24}
            />
            @{post.author.username}
          </Link>
        )}
        {<RelativeTime value={post.created_at} />}
      </div>
    </article>
  );
}
