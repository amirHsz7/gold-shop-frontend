
export function healthRepository() {
  function checkHealth() {
    return useApiFetch<{ status: string }>(
      '/health',
    )
  }
  function testAuth() {
    return useApiFetch<any>(
      '/users/me',
    )
  }

  return {
    checkHealth,
    testAuth
  }
}
