type EventCallback = (...args: any[]) => void

const listeners = new Map<string, Set<EventCallback>>()

export function on(event: string, callback: EventCallback) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set())
  }
  listeners.get(event)!.add(callback)
  return () => {
    listeners.get(event)?.delete(callback)
  }
}

export function emit(event: string, ...args: any[]) {
  listeners.get(event)?.forEach((cb) => {
    try {
      cb(...args)
    } catch {
      // silently ignore listener errors
    }
  })
}
