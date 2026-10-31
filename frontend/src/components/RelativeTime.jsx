import { useNow } from '../hooks/useNow'
import { formatFullDate, formatPostDate } from '../lib/formatDate'

export default function RelativeTime({ value }) {
  const now = useNow()

  return (
    <time dateTime={new Date(value).toISOString()} title={formatFullDate(value)}>
      {formatPostDate(value, now)}
    </time>
  )
}