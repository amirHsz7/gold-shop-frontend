export function useApiRequest() {
  const { $api } = useNuxtApp()

  function request<T>(
    url: string,
    options: Parameters<typeof $fetch>[1] = {},
  ) {
    return $api<T>(url, options)
  }

  return { request }
}