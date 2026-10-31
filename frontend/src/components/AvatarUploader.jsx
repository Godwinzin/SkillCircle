import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import Avatar from './Avatar'

const BUCKET = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// "https://…/avatars/<user-id>/123.png" → "<user-id>/123.png"
function pathFromUrl(url) {
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}

export default function AvatarUploader({ userId, name, initialUrl }) {
  const [url, setUrl] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function saveUrl(newUrl) {
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('id', userId)
      .select('id')

    if (updateError) return updateError.message
    if (data.length === 0) return 'Could not save your picture.'
    return ''
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // lets you pick the same file again later
    if (!file) return

    setError('')
    if (!EXTENSIONS[file.type]) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('The image must be smaller than 2 MB.')
      return
    }

    setBusy(true)

    // A new file name each time, so browsers never show a stale cached picture
    const path = `${userId}/${Date.now()}.${EXTENSIONS[file.type]}`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: '31536000' })

    if (uploadError) {
      setBusy(false)
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const saveError = await saveUrl(data.publicUrl)

    if (saveError) {
      await supabase.storage.from(BUCKET).remove([path]) // undo the upload
      setBusy(false)
      setError(saveError)
      return
    }

    // Tidy up: delete the previous picture
    const oldPath = url ? pathFromUrl(url) : null
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])

    setUrl(data.publicUrl)
    setBusy(false)
  }

  async function handleRemove() {
    if (!url) return
    setBusy(true)
    setError('')

    const saveError = await saveUrl(null)
    if (saveError) {
      setBusy(false)
      setError(saveError)
      return
    }

    const oldPath = pathFromUrl(url)
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])

    setUrl(null)
    setBusy(false)
  }

  return (
    <div>
      <div className="avatar-upload">
        <Avatar url={url} name={name} size={72} />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            hidden
          />
          <div className="actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Working…' : url ? 'Change picture' : 'Upload picture'}
            </button>
            {url && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRemove}
                disabled={busy}
              >
                Remove
              </button>
            )}
          </div>
          <p className="field-hint">JPG, PNG or WebP, up to 2 MB.</p>
        </div>
      </div>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}