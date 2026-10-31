

<template>
	<main
		dir="rtl"
		class="flex min-h-full w-full flex-1 flex-col overflow-x-hidden bg-cream text-dark-brown lg:min-h-0 lg:overflow-hidden"
	>
		<div
			class="flex w-full flex-1 flex-col overflow-hidden bg-cream lg:min-h-0 lg:flex-row-reverse"
		>
      <!-- تصویر -->
      <section
        class="relative h-[39dvh] min-h-[245px] max-h-[340px] shrink-0 bg-dark-brown lg:order-1 lg:h-full lg:min-h-0 lg:max-h-none lg:w-[47%] lg:flex-none"
      >
        <BaseImg
          src="/images/auth/login-ring-background.png"
          alt="انگشتر طلای نگین‌دار"
          width="100%"
          height="100%"
          fit="cover"
          position="center 55%"
          native-loading="eager"
          class="absolute inset-0"
        />

        <!-- لایه تیره برای خوانایی متن -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10"
        />

        <!-- لوگو -->
        <NuxtLink
          to="/"
          class="absolute right-6 top-5 z-10 flex items-center gap-2 text-white lg:right-8 lg:top-8"
        >
          <Icon
            name="lucide:gem"
            class="size-7 text-gold"
          />

          <div>
            <p class="text-sm font-semibold leading-5 lg:text-base">
              GoldStore
            </p>
            <p class="text-[9px] text-gold">
              زیبایی ماندگار است
            </p>
          </div>
        </NuxtLink>

        <!-- متن روی تصویر، فقط دسکتاپ -->
        <div
          class="absolute bottom-10 right-8 z-10 hidden max-w-[240px] text-right text-sm leading-7 text-gold lg:block"
        >
          <p>زیبایی،</p>
          <p>یک انتخاب نیست؛</p>
          <p>یک سبک زندگی است.</p>

          <div class="mt-3 h-px w-8 bg-gold" />
        </div>

        <!-- موج فقط در موبایل -->
        <svg
          class="absolute -bottom-px left-0 z-[1] h-[76px] w-full lg:hidden"
          viewBox="0 0 390 76"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 76 L0 64 C8 45 24 35 48 35 C82 35 108 45 145 48 C183 52 211 48 240 38 C267 29 286 32 310 23 C341 12 365 4 390 3 L390 76 Z"
            fill="#F5EFE7"
          />
        </svg>
      </section>

      <!-- بخش فرم -->
      <section
        class="relative z-[2] -mt-1 flex flex-1 flex-col bg-cream px-6 pb-5 pt-1 lg:order-2 lg:mt-0 lg:min-w-0 lg:justify-center lg:px-10 lg:py-8 xl:px-14"
      >
        <div class="mx-auto flex w-full max-w-md flex-1 flex-col lg:flex-none">
          <!-- عنوان -->
          <div class="mb-6 pt-1 lg:mb-7">

            <h1 class="text-lg font-bold leading-8 text-burgundy lg:text-xl">
              کد تایید را وارد کنید
            </h1>

            <p class="mt-1 text-xs leading-6 text-[#92908B]">
             کد تایید ارسال شده به شماره {{ otpState?.mobile }}را وارد کنید.
            </p>
          </div>

          <!-- فرم -->
          <form
            class="flex flex-col gap-4"
            @submit.prevent="submitForm"
          >
            <OtpInput
                ref="otp"
                v-model="code"
            />
            <BaseBtn
              type="submit"
              color="burgundy"
              size="md"
              full
              label="ارسال کد تایید"
              :loading="loading"
              :disabled="loading"
            >
              <template #icon>
                <Icon
                  name="lucide:arrow-right"
                  class="size-4"
                />
              </template>
            </BaseBtn>

            <p
              v-if="errorMessage"
              role="alert"
              class="text-xs leading-5 text-red-600"
            >
              {{ errorMessage }}
            </p>
          </form>

          <!-- ثبت نام -->
          <div class="text-start mt-4 text-xs text-[#92908B]">
            <NuxtLink
              to="/register"
              class="font-semibold text-burgundy"
            >
              تغییر شماره موبایل
            </NuxtLink>
          </div>

          <!-- فوتر -->
          <footer class="mt-auto pt-10 text-center lg:pt-14">
            <div class="mb-2 flex items-center justify-center gap-5">
              <span class="h-px w-12 bg-[#E4D8C8]" />

              <Icon
                name="lucide:gem"
                class="size-7 text-[#C9B69D]"
                :stroke-width="1.4"
              />

              <span class="h-px w-12 bg-[#E4D8C8]" />
            </div>

            <p class="text-[10px] leading-5 text-[#92908B]">
              طلا، فقط یک زیور نیست؛ یک داستان است.
            </p>
          </footer>
        </div>
      </section>
    </div>
  </main>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import BaseBtn from '~/components/base/button/BaseBtn.vue'
import OtpInput from '~/components/base/inputs/OtpInput.vue'
import { authRepository } from '~/repositories/auth'
import { useToast } from '@/composables/useToast'

const { notify } = useToast()

definePageMeta({
  layout: 'auth',
})

const otpState = useOtpState()
const { verifyOtp } = authRepository()

const code = ref('')
const loading = ref(false)
const errorMessage = ref('')

// اگه کاربر مستقیم اومد اینجا یا صفحه رو رفرش کرد، برگرده به login
if (!otpState.value) {
  await navigateTo('/login')
}

const userStore = useUserStore() 

async function submitForm() {
  if (loading.value || !otpState.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    const res = await verifyOtp({
      mobile: otpState.value.mobile,
      code: code.value,
      purpose: otpState.value.purpose,
    })

    userStore.setSession(res.data)
    otpState.value = null
    notify({ message: 'خوش آمدید.', color: 'green', textColor: '#ffffff', position: 'bottom', timeout: 3000 })
    await navigateTo('/')
  }
  catch (error: any) {
    errorMessage.value
      = error?.data?.message
        || 'تأیید کد با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
  }
  finally {
    loading.value = false
  }
}
</script>