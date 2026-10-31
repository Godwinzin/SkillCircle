import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PostForm from '../components/PostForm'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NewPost() {
  usePageTitle("Ask a question");
  const navigate = useNavigate()

  async function handleCreate(values) {
    const { data, error } = await supabase
      .from('posts')
      .insert(values)
      .select('id')
      .single()

    if (error) return error.message
    navigate(`/posts/${data.id}`)
    return ''
  }

  return (
    <div className="auth-card">
      <h1>Ask a question</h1>
      <p className="muted">Be specific. Good questions get better answers.</p>
      <PostForm
        submitLabel="Post question"
        submittingLabel="Posting…"
        onSubmit={handleCreate}
      />
    </div>
  )
}