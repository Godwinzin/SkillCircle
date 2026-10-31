import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function VoteButton({ answerId, count, voted, canVote, title }) {
  const [state, setState] = useState({ count, voted })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    if (busy) return
    setBusy(true)
    setError('')

    // Optimistic update: change the screen first, then tell the server
    const previous = state
    setState(
      previous.voted
        ? { count: previous.count - 1, voted: false }
        : { count: previous.count + 1, voted: true }
    )

    const { error: opError } = previous.voted
      ? await supabase.from('answer_votes').delete().eq('answer_id', answerId)
      : await supabase.from('answer_votes').insert({ answer_id: answerId })

    if (opError) {
      setState(previous) // undo
      setError('Could not save your vote.')
    }
    setBusy(false)
  }

  return (
    <div className="vote">
      <button
        className={`btn btn-ghost vote-btn ${state.voted ? 'is-voted' : ''}`}
        onClick={toggle}
        disabled={!canVote || busy}
        aria-pressed={state.voted}
        title={title}
      >
        ▲ {state.count}
      </button>
      {error && (
        <span className="field-hint" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}