export function getPaymentsApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    'http://localhost:8081/api/v1'

  const normalized = raw.replace(/\/$/, '')
  if (normalized.endsWith('/api/v1')) return normalized
  return `${normalized}/api/v1`
}
