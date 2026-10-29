import type { Directive, DirectiveBinding } from 'vue'

interface RippleElement extends HTMLElement {
  _ripple?: {
    cleanup: () => void
  }
}

export const vRipple: Directive<RippleElement> = {
  mounted(el: RippleElement, binding: DirectiveBinding) {
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    el.style.overflow = 'hidden'

    const pointerDownHandler = (event: PointerEvent) => {
      if (event.button !== 0) return

      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
        return
      }

      const rect = el.getBoundingClientRect()
      const circle = document.createElement('span')

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const cornerX = Math.max(x, rect.width - x)
      const cornerY = Math.max(y, rect.height - y)
      const radius = Math.sqrt(cornerX * cornerX + cornerY * cornerY)
      const diameter = radius * 2

      circle.style.position = 'absolute'
      circle.style.borderRadius = '50%'
      circle.style.pointerEvents = 'none'
      circle.style.backgroundColor = 'currentColor'
      circle.style.width = `${diameter}px`
      circle.style.height = `${diameter}px`
      circle.style.left = `${x - radius}px`
      circle.style.top = `${y - radius}px`

      circle.style.opacity = '0.2'
      circle.style.transform = 'scale(0)'
      circle.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'

      el.appendChild(circle)

      void circle.offsetWidth

      circle.style.transform = 'scale(1)'

      let released = false

      const releaseEvent = () => {
        if (released) return
        released = true

        circle.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
        circle.style.opacity = '0'

        setTimeout(() => {
          circle.remove()
        }, 300)

        document.removeEventListener('pointerup', releaseEvent)
        document.removeEventListener('pointercancel', releaseEvent)
        el.removeEventListener('pointerleave', releaseEvent)
      }

      document.addEventListener('pointerup', releaseEvent)
      document.addEventListener('pointercancel', releaseEvent)
      el.addEventListener('pointerleave', releaseEvent)
    }

    el.addEventListener('pointerdown', pointerDownHandler)

    el._ripple = {
      cleanup: () => {
        el.removeEventListener('pointerdown', pointerDownHandler)
      },
    }
  },

  unmounted(el: RippleElement) {
    if (el._ripple) {
      el._ripple.cleanup()
      delete el._ripple
    }
  },
}
