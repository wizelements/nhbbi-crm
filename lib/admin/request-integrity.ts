/** Pure and Edge-compatible origin policy for privileged browser mutations. */
export function isSameOriginMutation(method: string, origin: string | null, targetOrigin: string): boolean {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true
  return origin !== null && origin === targetOrigin
}
