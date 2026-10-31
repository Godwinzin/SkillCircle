import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Feed from '../components/Feed'
import { usePageTitle } from '../hooks/usePageTitle';

export default function Home() {
  usePageTitle();
  const { user } = useAuth()

  return (
    <>
      {!user && (
        <section className="hero">
          <h1>Learn together. Grow faster.</h1>
          <p className="muted">
            Ask questions, share answers and build your skills with people
            learning the same things.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Log in
            </Link>
          </div>
        </section>
      )}
      <Feed />
    </>
  )
}