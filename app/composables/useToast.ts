import { ref } from 'vue';

export interface ToastOptions {
  message?: string;
  caption?: string | null;
  color?: string;
  textColor?: string;
  timeout?: number;
  position?: string;
}

export interface ToastItem {
  id: number;
  message: string;
  caption: string | null;
  color: string;
  textColor: string;
}

const toasts = ref<ToastItem[]>([]);
const globalPosition = ref<string>('top-right');

export function useToast() {
  const notify = (options: string | ToastOptions) => {
    const config = typeof options === 'string' ? { message: options } : options;

    const id = Date.now() + Math.random();
    
    const message = config.message || '';
    const caption = config.caption || null;
    const color = config.color || 'green';
    const textColor = config.textColor || config.color || 'white'; 
    const timeout = config.timeout !== undefined ? config.timeout : 3000;
    const position = config.position || null;

    if (position) {
      globalPosition.value = position;
    }

    toasts.value.push({ id, message, caption, color, textColor });
    
    if (timeout > 0) {
      setTimeout(() => {
        removeToast(id);
      }, timeout);
    }
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return { toasts, globalPosition, notify, removeToast };
}
