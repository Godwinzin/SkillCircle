export function PostListSkeleton({ count = 3 }) {
  return (
    <div role="status">
      <span className="sr-only">Loading posts…</span>
      <ul className="post-list" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <div className="card">
              <span className="skeleton skeleton-title" />
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line short" />
              <div className="post-meta">
                <span className="skeleton skeleton-badge" />
                <span className="skeleton skeleton-badge" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading question…</span>
      <div className="card" aria-hidden="true">
        <span className="skeleton skeleton-badge" />
        <span className="skeleton skeleton-title" style={{ marginTop: '1rem' }} />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line short" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading profile…</span>
      <div className="card" aria-hidden="true">
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-line short" />
        <span className="skeleton skeleton-badge" />
      </div>
    </div>
  )
}