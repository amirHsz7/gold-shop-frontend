export const toggleBodyScroll = (disable: boolean): void => {
  if (typeof window === 'undefined') return;

  if (disable) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};