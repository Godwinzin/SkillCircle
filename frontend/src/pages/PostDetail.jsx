import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import AnswerForm from "../components/AnswerForm";
import EditAnswerForm from "../components/EditAnswerForm";
import { PostDetailSkeleton } from "../components/Skeletons";
import VoteButton from "../components/VoteButton";
import RelativeTime from "../components/RelativeTime";
import Comments from "../components/Comments";
import Avatar from "../components/Avatar";
import Markdown from "../components/Markdown";
import ConfirmDialog from "../components/ConfirmDialog";
import { friendlyError } from "../lib/errors";
import { usePageTitle } from "../hooks/usePageTitle";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState({ key: null, post: null, error: "" });
  const [reloadCount, setReloadCount] = useState(0);
  const [actionError, setActionError] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: "post" | "answer", id }
  const [deleting, setDeleting] = useState(false);

  usePageTitle(result.post?.title);

  useEffect(() => {
    let ignore = false;

    supabase
      .from("posts")
      .select(
        `id, title, body, is_solved, created_at, author_id,
         category:categories(name, slug),
         author:profiles(username, avatar_url),
         answers(
          id, body, is_accepted, vote_count, created_at, author_id,
          author:profiles!author_id(username, avatar_url),
          my_votes:answer_votes(user_id)
         ),
        comments(
          id, body, created_at, answer_id, author_id,
          author:profiles!author_id(username, avatar_url)
        )`,
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return;
        setResult({ key: id, post: data, error: error?.message ?? "" });
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadCount]);

  const refresh = () => setReloadCount((n) => n + 1);

  if (result.key !== id) return <PostDetailSkeleton />;

  if (result.error) {
    return (
      <div className="card empty">
        <p className="alert alert-error" role="alert">
          {friendlyError(result.error)}
        </p>
        <button className="btn btn-ghost" onClick={refresh}>
          Try again
        </button>
      </div>
    );
  }

  if (!result.post) {
    return (
      <div className="card empty">
        <p>We couldn’t find that question.</p>
        <Link to="/" className="btn btn-ghost">
          Back to questions
        </Link>
      </div>
    );
  }

  const post = result.post;
  const isPostAuthor = user?.id === post.author_id;

  // accepted answer is first, then the most votes, then the oldest
  const answers = [...post.answers].sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) return a.is_accepted ? -1 : 1;
    if (a.vote_count !== b.vote_count) return b.vote_count - a.vote_count;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const comments = [...post.comments].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
  const questionComments = comments.filter((c) => !c.answer_id);

  async function acceptAnswer(answerId) {
    setActionError("");
    const { error } = await supabase.rpc("accept_answer", {
      p_answer_id: answerId,
    });
    if (error) setActionError(friendlyError(error));
    else refresh();
  }

  // Runs when the person clicks "Delete" inside the popup
  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError("");

    const isPost = pendingDelete.type === "post";
    const { data, error } = await supabase
      .from(isPost ? "posts" : "answers")
      .delete()
      .eq("id", pendingDelete.id)
      .select("id");

    setDeleting(false);
    setPendingDelete(null);

    if (error) setActionError(friendlyError(error));
    else if (data.length === 0) setActionError("Nothing was deleted.");
    else if (isPost) navigate("/");
    else refresh();
  }

  return (
    <article>
      <Link to="/" className="back-link">
        ← Back to questions
      </Link>

      <div className="card question-card">
        <div className="post-meta">
          <span className="badge">{post.category?.name}</span>
          {post.is_solved && (
            <span className="badge badge-success">Solved</span>
          )}
        </div>
        <h1>{post.title}</h1>
        <Markdown className="markdown-block">{post.body}</Markdown>
        <div className="post-meta">
          <span>Asked by</span>
          <Link to={`/u/${post.author.username}`} className="author">
            <Avatar
              url={post.author.avatar_url}
              name={post.author.username}
              size={24}
            />
            @{post.author.username}
          </Link>
          <RelativeTime value={post.created_at} />
        </div>

        {isPostAuthor && (
          <div className="actions">
            <Link to={`/posts/${post.id}/edit`} className="btn btn-ghost">
              Edit question
            </Link>
            <button
              className="btn btn-danger"
              onClick={() => setPendingDelete({ type: "post", id: post.id })}
            >
              Delete question
            </button>
          </div>
        )}
        <Comments
          comments={questionComments}
          postId={post.id}
          onChanged={refresh}
        />
      </div>

      <section className="answers">
        <h2>
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {actionError && (
          <p className="alert alert-error" role="alert">
            {actionError}
          </p>
        )}

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

                {editingAnswerId === answer.id ? (
                  <EditAnswerForm
                    answer={answer}
                    onSaved={() => {
                      setEditingAnswerId(null);
                      refresh();
                    }}
                    onCancel={() => setEditingAnswerId(null)}
                  />
                ) : (
                  <>
                    <Markdown className="markdown-block">
                      {answer.body}
                    </Markdown>
                    <div className="post-meta">
                      <span>Answered by</span>
                      <Link
                        to={`/u/${answer.author.username}`}
                        className="author"
                      >
                        <Avatar
                          url={answer.author.avatar_url}
                          name={answer.author.username}
                          size={24}
                        />
                        @{answer.author.username}
                      </Link>
                      <RelativeTime value={answer.created_at} />
                    </div>

                    <div className="actions">
                      <VoteButton
                        key={`${answer.id}:${answer.vote_count}:${answer.my_votes.length}`}
                        answerId={answer.id}
                        count={answer.vote_count}
                        voted={answer.my_votes.length > 0}
                        canVote={Boolean(user) && user.id !== answer.author_id}
                        title={
                          !user
                            ? "Log in to vote"
                            : user.id === answer.author_id
                              ? "You can’t vote on your own answer"
                              : "This answer was helpful"
                        }
                      />
                      {isPostAuthor &&
                        !answer.is_accepted &&
                        answer.author_id !== user.id && (
                          <button
                            className="btn btn-primary"
                            onClick={() => acceptAnswer(answer.id)}
                          >
                            Accept answer
                          </button>
                        )}
                      {user?.id === answer.author_id && (
                        <>
                          <button
                            className="btn btn-ghost"
                            onClick={() => setEditingAnswerId(answer.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() =>
                              setPendingDelete({
                                type: "answer",
                                id: answer.id,
                              })
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    <Comments
                      comments={comments.filter(
                        (c) => c.answer_id === answer.id,
                      )}
                      postId={post.id}
                      answerId={answer.id}
                      onChanged={refresh}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {user ? (
          <AnswerForm postId={post.id} onPosted={refresh} />
        ) : (
          <p className="card muted">
            <Link to="/login" state={{ from: location }}>
              Log in
            </Link>{" "}
            to answer this question.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete?.type === "post"
            ? "Delete this question?"
            : "Delete this answer?"
        }
        message={
          pendingDelete?.type === "post"
            ? "This also deletes all of its answers and comments. This can’t be undone."
            : "Its comments will be deleted too. This can’t be undone."
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </article>
  );
}
