import { useState } from 'react'

function hueFromName(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
}

export default function Avatar({ url, name = '?', size = 40 }) {
  const [failed, setFailed] = useState(false)
  const style = { '--size': `${size}px` }

  if (url && !failed) {
    return (
      <img
        className="avatar"
        src={url}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        style={style}
        onError={() => setFailed(true)}
      />
    )
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className="avatar avatar-initials"
      aria-hidden="true"
      style={{ ...style, background: `hsl(${hueFromName(name)} 50% 38%)` }}
    >
      {initials}
    </span>
  )
}