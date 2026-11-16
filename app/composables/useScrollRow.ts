// ردیف اسکرول افقی با وضعیت فلش‌ها؛ ref را با نام trackRef به المان اسکرول بده
export const useScrollRow = () => {
  const EDGE_TOLERANCE = 4

  const trackRef = ref<HTMLElement | null>(null)
  const canPrev = ref(false)
  const canNext = ref(false)

  // در راست‌به‌چپ مقدار scrollLeft منفی است، پس قدر مطلق آن ملاک است
  const update = () => {
    const track = trackRef.value

    if (!track) return

    const offset = Math.abs(track.scrollLeft)

    canPrev.value = offset > EDGE_TOLERANCE
    canNext.value
      = offset + track.clientWidth < track.scrollWidth - EDGE_TOLERANCE
  }

  // جلو (1) یعنی به‌سمت انتهای لیست؛ در راست‌به‌چپ این یعنی حرکت به چپ
  const scrollPage = (direction: 1 | -1) => {
    const track = trackRef.value

    if (!track) return

    const sign = getComputedStyle(track).direction === 'rtl' ? -1 : 1
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    track.scrollBy({
      left: sign * direction * track.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  let observer: ResizeObserver | undefined

  onMounted(() => {
    update()

    if (trackRef.value) {
      observer = new ResizeObserver(update)
      observer.observe(trackRef.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { trackRef, canPrev, canNext, update, scrollPage }
}