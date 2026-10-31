import { useSyncExternalStore } from 'react'

const MINUTE = 60_000

function subscribe(onChange) {
  const timer = setInterval(onChange, 30_000)
  return () => clearInterval(timer)
}

// The current time, rounded down to the minute
function getSnapshot() {
  return Math.floor(Date.now() / MINUTE) * MINUTE
}

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot)
}