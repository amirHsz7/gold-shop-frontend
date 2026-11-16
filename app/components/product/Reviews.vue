<template>
  <section id="reviews" class="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12" aria-labelledby="reviews-title">

    <!-- خلاصه‌ی امتیاز و فرم -->
    <div class="flex flex-col gap-4 self-start rounded-3xl border border-nude/25 bg-white p-5 lg:sticky lg:top-24">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center">
          <span class="text-4xl font-bold leading-tight text-burgundy">
            {{ summary.count > 0 ? toFa(summary.average) : '—' }}
          </span>
          <span class="text-xs text-dark-brown/60">{{ toFa(summary.count) }} امتیاز</span>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2 text-xs text-dark-brown/70">
            <span class="w-3 text-center">{{ toFa(star) }}</span>
            <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-nude/20">
              <span
                class="block h-full rounded-full bg-gold"
                :style="{ width: `${percent(star)}%` }"
              />
            </span>
          </div>
        </div>
      </div>

      <!-- ورود لازم است -->
      <template v-if="!userStore.isLoggedIn">
        <BaseBtn outline rounded no-caps color="burgundy" label="برای ثبت نظر وارد شوید" to="/login" class="h-12" />
      </template>

      <form v-else class="flex flex-col gap-3" novalidate @submit.prevent="submit">
        <div
          class="flex items-center gap-1"
          role="radiogroup"
          aria-label="امتیاز شما"
          @mouseleave="hovered = 0"
        >
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            role="radio"
            :aria-checked="rating === star"
            :aria-label="`${toFa(star)} از ۵`"
            class="rounded p-0.5 transition-transform active:scale-90"
            @mouseenter="hovered = star"
            @click="rating = rating === star ? 0 : star"
          >
            <ProductStar :filled="star <= (hovered || rating)" :size="28" />
          </button>
          <span class="ms-2 text-xs text-dark-brown/60">اختیاری</span>
        </div>

        <BaseInput
          v-model="body"
          type="textarea"
          :rows="4"
          label="نظر شما"
          :maxlength="1000"
          counter
          :error="!!bodyError"
          :error-message="bodyError"
        />

        <BaseBtn
          color="burgundy"
          rounded
          no-caps
          label="ثبت نظر"
          class="h-12"
          :loading="submitting"
          @click="submit"
        />
        <p class="text-xs text-dark-brown/60">نظر شما بعد از تأیید نمایش داده می‌شود.</p>
      </form>
    </div>

    <!-- لیست نظرها -->
    <div class="flex flex-col gap-4">
      <p
        v-if="comments.length === 0"
        class="rounded-3xl border border-dashed border-nude/40 p-8 text-center text-sm text-dark-brown/60"
      >
        هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید.
      </p>

      <article
        v-for="comment in comments"
        :key="comment.id"
        class="flex flex-col gap-3 rounded-3xl border border-nude/25 bg-white/65 p-5"
      >
        <header class="flex items-center gap-3">
          <span class="flex size-10 items-center justify-center rounded-full bg-burgundy font-semibold text-cream">
            {{ initial(comment.author.name) }}
          </span>
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-sm font-semibold">{{ firstName(comment.author.name) }}</span>
            <time class="text-xs text-dark-brown/60" :datetime="comment.createdAt">
              {{ formatDate(comment.createdAt) }}
            </time>
          </div>

          <span
            v-if="comment.rating"
            class="ms-auto flex gap-0.5"
            :aria-label="`امتیاز ${toFa(comment.rating)} از ۵`"
          >
            <ProductStar
              v-for="star in 5"
              :key="star"
              :filled="star <= comment.rating"
              :size="16"
            />
          </span>
        </header>

        <p class="whitespace-pre-line text-sm leading-loose">{{ comment.body }}</p>

        <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="ms-6 rounded-2xl bg-gold/15 p-3.5 text-sm leading-loose"
        >
          <span class="font-semibold text-burgundy">
            {{ reply.author.isAdmin ? 'پاسخ فروشگاه' : firstName(reply.author.name) }}:
          </span>
          {{ reply.body }}
        </div>
      </article>

      <BaseBtn
        v-if="hasMore"
        outline
        round
        no-caps
        color="burgundy"
        label="نمایش نظرهای بیشتر"
        class="h-12 self-center px-8!"
        :loading="loadingMore"
        @click="loadMore"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommentsResponse, PublicCommentThread } from '~/types/comment'
import BaseBtn from '../base/button/BaseBtn.vue'
import BaseInput from '../base/inputs/base-input/BaseInput.vue'

const props = defineProps<{ slug: string }>()
const emit = defineEmits<{ submitted: [] }>()

const LIMIT = 10

const userStore = useUserStore()
const toast = useFormToast()
const { request } = useApiRequest()
const { getMessage } = useApiError()

// ───── دریافت نظرها ─────
const { data } = await useApiFetch<CommentsResponse>(
  () => `/products/${props.slug}/comments`,
  { key: `comments-${props.slug}`, query: { page: 1, limit: LIMIT } },
)

const summary = computed(
  () =>
    data.value?.data.summary ?? {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
)

// صفحه‌های بعدی به همین لیست اضافه می‌شوند
const extra = ref<PublicCommentThread[]>([])
const page = ref(1)

const comments = computed(() => [...(data.value?.data.items ?? []), ...extra.value])
const totalPages = computed(() => data.value?.data.pagination.totalPages ?? 1)
const hasMore = computed(() => page.value < totalPages.value)

const loadingMore = ref(false)

const loadMore = async () => {
  loadingMore.value = true

  try {
    const res = await request<CommentsResponse>(`/products/${props.slug}/comments`, {
      query: { page: page.value + 1, limit: LIMIT },
    })

    extra.value.push(...res.data.items)
    page.value += 1
  }
  catch (error) {
    toast.error(getMessage(error))
  }
  finally {
    loadingMore.value = false
  }
}

// ───── ثبت نظر ─────
const body = ref('')
const rating = ref(0)
// ستاره‌ای که موس روی آن است (برای پیش‌نمایش)
const hovered = ref(0)
const bodyError = ref('')
const submitting = ref(false)

const submit = async () => {
  bodyError.value = ''

  if (body.value.trim().length < 3) {
    bodyError.value = 'متن نظر باید حداقل ۳ کاراکتر باشد'
    return
  }

  submitting.value = true

  try {
    const res = await request<{ message: string }>(`/products/${props.slug}/comments`, {
      method: 'POST',
      body: {
        body: body.value.trim(),
        ...(rating.value > 0 ? { rating: rating.value } : {}),
      },
    })

    toast.success(res.message)
    body.value = ''
    rating.value = 0
    emit('submitted')
  }
  catch (error) {
    toast.error(getMessage(error))
  }
  finally {
    submitting.value = false
  }
}

// ───── نمایش ─────
const toFa = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

const percent = (star: number) => {
  const total = summary.value.count
  const count = summary.value.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0

  return total > 0 ? Math.round((count / total) * 100) : 0
}

// فقط اسم کوچک نمایش داده می‌شود
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
const initial = (name: string) => firstName(name).charAt(0)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' }).format(new Date(iso))
</script>