
import type { UseFetchOptions } from 'nuxt/app'

export function useApiFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {},
) {
  const { $api } = useNuxtApp()

  return useFetch(url, {
    ...options,
    $fetch: $api,
  })
}
