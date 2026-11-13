// اگر notify خودکار import نمی‌شود، import آن را اینجا اضافه کن

export const useFormToast = () => {
const { notify } = useToast()

  const success = (message: string) =>
    notify({
      message,
      color: 'green',
      textColor: '#ffffff',
      position: 'top',
      timeout: 3000,
    })

  const error = (message: string) =>
    notify({
      message,
      color: 'red',
      textColor: '#ffffff',
      position: 'top',
      timeout: 5000,
    })

  const warning = (message: string) =>
    notify({
      message,
      color: 'orange',
      textColor: '#ffffff',
      position: 'top',
      timeout: 5000,
    })

  return { success, error, warning }
}