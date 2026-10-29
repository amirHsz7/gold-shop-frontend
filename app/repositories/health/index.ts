
export function healthRepository() {
  function checkHealth() {
    return useApiFetch<{ status: string }>(
      'http://localhost:5000/health',
    )
  }

  return {
    checkHealth,
  }
}
