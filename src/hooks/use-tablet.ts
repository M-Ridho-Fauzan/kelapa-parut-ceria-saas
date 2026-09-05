import * as React from "react"

const TABLET_BREAKPOINT = 1024

function getSnapshot(): boolean {
  return window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`).matches
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsTablet() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
