export interface Position {
  vertical: 'top' | 'center' | 'bottom'
  horizontal: 'left' | 'middle' | 'right'
}

export interface Offset {
  0: number
  1: number
  length: 2
}

export interface PositionConfig {
  targetEl: HTMLElement
  anchorEl: HTMLElement
  offset?: [number, number]
  anchorOrigin: Position
  selfOrigin: Position
  absoluteOffset?: { top: number; left: number }
  fit?: boolean
  cover?: boolean
  maxHeight?: string | number
  maxWidth?: string | number
  positionType?: 'absolute' | 'fixed'
}

export function validatePosition(pos: unknown): boolean {
  const parts = String(pos || '').split(' ')
  if (parts.length !== 2) {
    return false
  }

  if (['top', 'center', 'bottom'].includes(parts[0]) !== true) {
    console.error('Anchor/Self position must start with one of top/center/bottom')
    return false
  }

  if (['left', 'middle', 'right', 'start', 'end'].includes(parts[1]) !== true) {
    console.error('Anchor/Self position must end with one of left/middle/right/start/end')
    return false
  }

  return true
}

export function validateOffset(val: unknown): boolean {
  if (!val) {
    return true
  }
  if (!Array.isArray(val) || val.length !== 2) {
    return false
  }
  if (typeof val[0] !== 'number' || typeof val[1] !== 'number') {
    return false
  }
  return true
}

type HorizontalAlias = 'left' | 'middle' | 'right' | 'start' | 'end'
type Direction = 'ltr' | 'rtl'
type HorizontalKey = `${HorizontalAlias}#${Direction}`

const horizontalPos: Record<HorizontalKey, 'left' | 'middle' | 'right'> = {
  'start#ltr': 'left',
  'start#rtl': 'right',
  'end#ltr': 'right',
  'end#rtl': 'left',
  'left#ltr': 'left',
  'left#rtl': 'left',
  'middle#ltr': 'middle',
  'middle#rtl': 'middle',
  'right#ltr': 'right',
  'right#rtl': 'right',
}

export function parsePosition(pos: unknown, rtl?: boolean): Position {
  const parts = String(pos || '').split(' ')
  const dir = rtl === true ? 'rtl' : 'ltr'
  const vertical = parts[0] as Position['vertical']
  const horizontal = horizontalPos[
    `${parts[1] as HorizontalAlias}#${dir}` as HorizontalKey
  ]

  return {
    vertical,
    horizontal,
  }
}

export function getAnchorProps(el: HTMLElement, offset?: [number, number]) {
  let { top, left, right, bottom, width, height } = el.getBoundingClientRect()

  if (offset !== void 0) {
    top -= offset[1]
    left -= offset[0]
    bottom += offset[1]
    right += offset[0]

    width += offset[0]
    height += offset[1]
  }

  return {
    top,
    bottom,
    height,
    left,
    right,
    width,
    middle: left + (right - left) / 2,
    center: top + (bottom - top) / 2,
  }
}

function getAbsoluteAnchorProps(absoluteOffset: { top: number; left: number }, offset?: [number, number]) {
  let { top, left } = absoluteOffset

  if (offset !== void 0) {
    top += offset[1]
    left += offset[0]
  }

  return {
    top,
    bottom: top + 1,
    height: 1,
    left,
    right: left + 1,
    width: 1,
    middle: left,
    center: top,
  }
}

function getTargetProps(width: number, height: number) {
  return {
    top: 0,
    center: height / 2,
    bottom: height,
    left: 0,
    middle: width / 2,
    right: width,
  }
}

function getTopLeftProps(anchorProps: any, targetProps: any, anchorOrigin: Position, selfOrigin: Position) {
  return {
    top: anchorProps[anchorOrigin.vertical] - targetProps[selfOrigin.vertical],
    left: anchorProps[anchorOrigin.horizontal] - targetProps[selfOrigin.horizontal],
  }
}

function applyBoundaries(props: any, anchorProps: any, targetProps: any, anchorOrigin: Position, selfOrigin: Position) {
  const margin = 10
  const bodyWidth = document.documentElement.clientWidth
  const bodyHeight = document.documentElement.clientHeight

  let { top, left } = props
  const width = targetProps.right
  const height = targetProps.bottom

  if (top < margin) {
    const anchorBottom = anchorProps.bottom
    const selfOffset = targetProps[selfOrigin.vertical]
    top = anchorBottom - selfOffset

    if (top < margin) {
      top = margin
    }
  }

  if (top + height > bodyHeight - margin) {
    const anchorTop = anchorProps.top
    const selfOffset = targetProps[selfOrigin.vertical === 'top' ? 'bottom' : selfOrigin.vertical]

    top = anchorTop - selfOffset

    if (top + height > bodyHeight - margin) {
      top = bodyHeight - margin - height
    }
  }

  if (left < margin) {
    const anchorRight = anchorProps.right
    const selfOffset = targetProps[selfOrigin.horizontal]
    left = anchorRight - selfOffset

    if (left < margin) {
      left = margin
    }
  }

  if (left + width > bodyWidth - margin) {
    const anchorLeft = anchorProps.left
    const selfOffset =
      targetProps[selfOrigin.horizontal === 'left' ? 'right' : selfOrigin.horizontal]

    left = anchorLeft - selfOffset

    if (left + width > bodyWidth - margin) {
      left = bodyWidth - margin - width
    }
  }

  props.top = top
  props.left = left
}

let vpLeft: number | undefined
let vpTop: number | undefined

export function setPosition(cfg: PositionConfig, retryNumber = 0): void {
  const {
    targetEl,
    anchorEl,
    offset,
    anchorOrigin,
    selfOrigin,
    absoluteOffset,
    fit,
    cover,
    maxHeight,
    maxWidth,
    positionType = 'absolute',
  } = cfg

  if (targetEl == null || anchorEl == null || retryNumber > 5) {
    return
  }

  if (targetEl.offsetHeight === 0 || targetEl.offsetWidth === 0) {
    setTimeout(() => {
      setPosition(cfg, retryNumber + 1)
    }, 10)
    return
  }

  if (
    typeof window !== 'undefined' &&
    window.visualViewport &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  ) {
    const el = document.body.style
    const { offsetLeft: left, offsetTop: top } = window.visualViewport

    if (left !== vpLeft) {
      el.setProperty('--q-pe-left', left + 'px')
      vpLeft = left
    }
    if (top !== vpTop) {
      el.setProperty('--q-pe-top', top + 'px')
      vpTop = top
    }
  }

  const { scrollLeft, scrollTop } = targetEl

  const anchorProps =
    absoluteOffset === void 0
      ? getAnchorProps(anchorEl, cover === true ? [0, 0] : offset)
      : getAbsoluteAnchorProps(absoluteOffset, offset)

  Object.assign(targetEl.style, {
    top: 0,
    left: 0,
    minWidth: null,
    minHeight: null,
    maxWidth,
    maxHeight,
    visibility: 'visible',
  })

  const { offsetWidth: origElWidth, offsetHeight: origElHeight } = targetEl

  const { elWidth, elHeight } =
    fit === true || cover === true
      ? {
          elWidth: Math.max(anchorProps.width, origElWidth),
          elHeight: cover === true ? Math.max(anchorProps.height, origElHeight) : origElHeight,
        }
      : { elWidth: origElWidth, elHeight: origElHeight }

  const elStyle: Record<string, string | number | undefined> = { maxWidth, maxHeight }

  if (fit === true || cover === true) {
    elStyle.minWidth = anchorProps.width + 'px'
    if (cover === true) {
      elStyle.minHeight = anchorProps.height + 'px'
    }
  }

  Object.assign(targetEl.style, elStyle)

  const targetProps = getTargetProps(elWidth, elHeight)

  let props = getTopLeftProps(anchorProps, targetProps, anchorOrigin, selfOrigin)

  if (absoluteOffset === void 0 || offset === void 0) {
    applyBoundaries(props, anchorProps, targetProps, anchorOrigin, selfOrigin)
  } else {
    const { top, left } = props

    applyBoundaries(props, anchorProps, targetProps, anchorOrigin, selfOrigin)
  }

  const offsetY = positionType === 'fixed' ? 0 : window.scrollY
  const offsetX = positionType === 'fixed' ? 0 : window.scrollX

  targetEl.style.top = props.top + offsetY + 'px'
  targetEl.style.left = props.left + offsetX + 'px'

  targetEl.scrollLeft = scrollLeft
  targetEl.scrollTop = scrollTop
}
