<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-nude/10 text-nude"
    :class="size === 'sm' ? 'size-7' : 'size-9'"
    aria-hidden="true"
  >
    <BaseImg
      v-if="url"
      :src="url"
      alt=""
      fit="cover"
      no-spinner
      native-loading="lazy"
      class="h-full w-full"
    >
      <template #error>
        <Icon :name="icon" size="16px" />
      </template>
    </BaseImg>

    <Icon v-else :name="icon" size="16px" />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string | null
    icon?: string
    size?: 'sm' | 'md'
  }>(),
  { src: null, icon: 'lucide:gem', size: 'md' },
)

const assetUrl = useAssetUrl()

const url = computed(() => assetUrl(props.src))
</script>