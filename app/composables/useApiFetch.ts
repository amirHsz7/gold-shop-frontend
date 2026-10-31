import type { UseFetchOptions } from 'nuxt/app'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'

export function useApiFetch<T>(
  url: string | (() => string),
  options: Omit<UseFetchOptions<T>, 'method'> & { method?: HttpMethod } = {},
) {
  const { $api } = useNuxtApp()

  return useFetch(url, {
    ...(options as UseFetchOptions<T>),
    $fetch: $api as typeof $fetch,
  } as UseFetchOptions<T>)
}