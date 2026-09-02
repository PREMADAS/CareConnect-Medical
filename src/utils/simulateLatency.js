/**
 * Simulates network latency for dummy data resolution so that loading
 * skeletons behave the way they will once real API calls are wired in.
 * Replace the dummy resolver inside each service with a real `api.get(...)`
 * call and this wrapper can be removed with zero changes to callers.
 */
export function simulateLatency(data, ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms)
  })
}
