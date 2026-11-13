type ApiErrorData = {
  message?: string
  errors?: { field: string; message: string }[]
}

export const useApiError = () => {
  const getData = (error: unknown) =>
    (error as { data?: ApiErrorData } | null)?.data

  const getMessage = (
    error: unknown,
    fallback = 'خطایی رخ داد؛ دوباره تلاش کنید',
  ) => {
    const data = getData(error)

    if (!data?.message) return fallback

    const details = data.errors?.map(item => item.message).join('، ')

    return details ? `${data.message}: ${details}` : data.message
  }

  const getStatus = (error: unknown) => {
    const value = error as { statusCode?: number; status?: number } | null

    return value?.statusCode ?? value?.status
  }

  const getFieldErrors = (error: unknown) => getData(error)?.errors ?? []

  return { getMessage, getStatus, getFieldErrors }
}