// Turns raw network errors into something a person can act on
export function friendlyError(error) {
  const message = typeof error === 'string' ? error : (error?.message ?? '')

  const networkProblem =
    !navigator.onLine ||
    /failed to fetch|networkerror|network request failed|load failed/i.test(message)

  if (networkProblem) {
    return 'Can’t reach the server. Check your internet connection and try again.'
  }
  return message
}