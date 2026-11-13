<template>
  <div
    ref="rootRef"
    class="relative h-full"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <!-- با ماوس: کلیک به صفحه‌ی محصولات می‌رود. با لمس: منو باز و بسته می‌شود -->
    <NuxtLink
      to="/products"
      :class="NAV_LINK_CLASS"
      :active-class="NAV_ACTIVE_CLASS"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click.capture="onLinkClick"
    >
      دسته‌بندی‌ها
      <Icon
        name="lucide:chevron-down"
        size="15px"
        class="transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </NuxtLink>

    <!-- پاپ‌آپ دقیقاً زیر هدر شروع می‌شود، پس هاور بین لینک و پاپ‌آپ قطع نمی‌شود -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute start-0 top-full z-50 w-[min(760px,calc(100vw-2rem))]"
      >
        <div class="rounded-2xl border border-nude/20 bg-white p-6 shadow-xl">
          <div
            v-if="categories.length > 0"
            class="grid grid-cols-2 gap-x-8 gap-y-6 xl:grid-cols-3"
          >
            <div
              v-for="root in categories"
              :key="root.id"
              class="flex items-start gap-3"
            >
              <!-- تصویر دسته؛ لینک آن برای کیبورد تکراری است و فقط اسم دسته فوکوس می‌گیرد -->
              <NuxtLink
                :to="categoryLink(root.slug)"
                class="shrink-0"
                tabindex="-1"
                aria-hidden="true"
              >
                <BaseImg
                  v-if="root.imageUrl"
                  :src="assetUrl(root.imageUrl)"
                  :alt="root.name"
                  width="56px"
                  height="56px"
                  fit="cover"
                  no-spinner
                  class="shrink-0 rounded-full bg-nude/10 ring-1 ring-nude/20"
                >
                  <template #error>
                    <Icon name="lucide:gem" size="22px" class="text-nude" />
                  </template>
                </BaseImg>

                <span
                  v-else
                  class="flex size-14 shrink-0 items-center justify-center rounded-full bg-nude/10 text-nude ring-1 ring-nude/20"
                >
                  <Icon name="lucide:gem" size="22px" />
                </span>
              </NuxtLink>

              <div class="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                <NuxtLink
                  :to="categoryLink(root.slug)"
                  class="text-sm font-semibold text-burgundy hover:underline"
                >
                  {{ root.name }}
                </NuxtLink>

                <ul
                  v-if="root.children.length > 0"
                  class="m-0 flex list-none flex-col gap-1.5 p-0"
                >
                  <li v-for="child in root.children.slice(0, 5)" :key="child.id">
                    <NuxtLink
                      :to="categoryLink(child.slug)"
                      class="text-sm text-dark-gray transition-colors hover:text-burgundy"
                    >
                      {{ child.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p v-else class="m-0 text-sm text-dark-gray">دسته‌بندی‌ای ثبت نشده است.</p>

          <!-- با لمس، کلیک روی عنوان منو دیگر به صفحه‌ی محصولات نمی‌رود؛ راه رفتنش همین لینک است -->
          <div class="mt-6 border-t border-nude/20 pt-3">
            <NuxtLink
              to="/products"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline"
            >
              مشاهده‌ی همه‌ی محصولات
              <Icon name="lucide:arrow-left" size="16px" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PublicCategory } from '~/types/site'

defineProps<{ categories: PublicCategory[] }>()

type InputKind = 'mouse' | 'touch' | 'keyboard'

const route = useRoute()
const assetUrl = useAssetUrl()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

// آخرین نوع ورودی کاربر؛ با آن تصمیم می‌گیریم کلیک لینک را بگیریم یا نه
const lastInput = ref<InputKind>('mouse')

const show = () => {
  isOpen.value = true
}

const hide = () => {
  isOpen.value = false
}

// هاور فقط برای ماوس؛ لمس بعد از تاچ هم رویداد هاور شبیه‌سازی می‌کند و نباید باز و بسته‌ی دوباره بسازد
const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') show()
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') hide()
}

// فوکوس با کیبورد منو را باز می‌کند، ولی فوکوسی که از تاچ می‌آید نه (تاچ خودش کلیک را مدیریت می‌کند)
const onFocusIn = () => {
  if (lastInput.value !== 'touch') show()
}

// وقتی فوکوس کیبورد از کل منو بیرون رفت بسته می‌شود
const onFocusOut = (event: FocusEvent) => {
  const root = event.currentTarget as HTMLElement | null
  const next = event.relatedTarget as Node | null

  if (!root || !next || !root.contains(next)) hide()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') hide()
}

// لمس: منو باز و بسته می‌شود و لینک دنبال نمی‌شود
// (کلیک با ماوس و Enter با کیبورد، مثل قبل به /products می‌رود)
const onLinkClick = (event: MouseEvent) => {
  if (lastInput.value !== 'touch') return

  event.preventDefault()
  isOpen.value = !isOpen.value
}

const categoryLink = (slug: string) => ({
  path: '/products',
  query: { category: slug },
})

// ردیابی نوع ورودی و بستن منو با لمس یا کلیک بیرون از آن
// (در مرحله‌ی capture تا قبل از کلیک و فوکوس لینک ثبت شود)
const onDocumentPointerDown = (event: PointerEvent) => {
  lastInput.value = event.pointerType === 'mouse' ? 'mouse' : 'touch'

  const root = rootRef.value

  if (isOpen.value && root && !root.contains(event.target as Node)) hide()
}

const onDocumentKeydown = () => {
  lastInput.value = 'keyboard'
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onDocumentKeydown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown, true)
})

watch(() => route.fullPath, hide)
</script>