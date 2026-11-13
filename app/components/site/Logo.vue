<template>
  <span
    class="inline-flex flex-col items-center leading-none"
    :class="tone === 'gold' ? 'text-gold' : 'text-burgundy'"
    role="img"
    aria-label="گلدن"
  >
    <svg
      viewBox="0 0 24 24"
      class="mb-1 fill-current"
      :class="size === 'lg' ? 'size-5 lg:size-6' : 'size-3.5 lg:size-[18px]'"
      aria-hidden="true"
    >
      <path d="M12 2c.6 4.2 2.4 7 7 8-4.6 1-6.4 3.8-7 8-.6-4.2-2.4-7-7-8 4.6-1 6.4-3.8 7-8z" />
    </svg>

    <span
      class="font-serif uppercase"
      :class="
        size === 'lg'
          ? 'text-3xl tracking-[0.2em]'
          : 'text-xl tracking-[0.18em] lg:text-[26px] lg:tracking-[0.2em]'
      "
    >
      Golden
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'burgundy' | 'gold'
    size?: 'md' | 'lg'
  }>(),
  { tone: 'burgundy', size: 'md' },
)
</script>