<script setup lang="ts">
type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
  productCount: number;
};

type CategoryNode = CategoryItem & { children: CategoryItem[] };

const props = withDefaults(
  defineProps<{
    categories: CategoryNode[];
    rootLabel?: string;
    // آدرس بکند، چون imageUrl از API نسبی میاد (مثلاً /uploads/...)
    imageBaseUrl?: string;
  }>(),
  { rootLabel: "دسته‌بندی‌ها", imageBaseUrl: "" },
);

const emit = defineEmits<{
  edit: [category: CategoryItem];
  delete: [category: CategoryItem];
}>();

const imageSrc = (url: string) =>
  url.startsWith("http") ? url : props.imageBaseUrl + url;

// ستون فرزندها: خط افقی از کارت والد تا تنه‌ی عمودی
const childrenList =
  "relative flex flex-col ms-9 before:absolute before:-start-9 before:top-1/2 before:w-9 before:border-t-2 before:border-zinc-300";

// هر فرزند: خط افقی تا کارت + تکه‌ای از تنه‌ی عمودی
const childItem =
  "relative flex items-center py-1.5 ps-9 before:absolute before:start-0 before:top-1/2 before:w-9 before:border-t-2 before:border-zinc-300 after:absolute after:inset-y-0 after:start-0 after:border-s-2 after:border-zinc-300 first:after:top-1/2 last:after:bottom-1/2 only:after:hidden";

const card =
  "flex min-w-[240px] shrink-0 items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2";

const actionButton =
  "rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs hover:bg-zinc-100";

const dangerButton =
  "rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs text-red-700 hover:bg-red-50";
</script>

<template>
  <div class="overflow-x-auto px-1 pb-4 pt-2">
    <ul class="m-0 w-max min-w-full list-none p-0">
      <!-- گره‌ی ریشه‌ی مجازی -->
      <li class="flex items-center">
        <div
          class="flex flex-col items-start gap-0.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2"
        >
          <strong>{{ rootLabel }}</strong>
          <span class="text-xs text-zinc-500">
            {{ categories.length }} دسته‌ی اصلی
          </span>
        </div>

        <ul v-if="categories.length" :class="[childrenList, 'm-0 list-none p-0']">
          <!-- دسته‌های اصلی -->
          <li v-for="root in categories" :key="root.id" :class="childItem">
            <div :class="card">
              <img
                v-if="root.imageUrl"
                :src="imageSrc(root.imageUrl)"
                :alt="root.name"
                loading="lazy"
                class="size-9 shrink-0 rounded-md border border-zinc-200 object-cover"
                :class="{ 'opacity-60': !root.isActive }"
              />

              <div
                class="flex min-w-0 flex-1 flex-col gap-0.5"
                :class="{ 'opacity-60': !root.isActive }"
              >
                <strong class="truncate">{{ root.name }}</strong>
                <span class="text-xs text-zinc-500">
                  {{ root.productCount }} محصول
                  <template v-if="!root.isActive"> · غیرفعال</template>
                </span>
              </div>

              <div class="flex gap-1.5">
                <button
                  type="button"
                  :class="actionButton"
                  :aria-label="`ویرایش ${root.name}`"
                  @click="emit('edit', root)"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  :class="dangerButton"
                  :aria-label="`حذف ${root.name}`"
                  @click="emit('delete', root)"
                >
                  حذف
                </button>
              </div>
            </div>

            <!-- زیردسته‌ها -->
            <ul
              v-if="root.children.length"
              :class="[childrenList, 'm-0 list-none p-0']"
            >
              <li v-for="child in root.children" :key="child.id" :class="childItem">
                <div :class="card">
                  <img
                    v-if="child.imageUrl"
                    :src="imageSrc(child.imageUrl)"
                    :alt="child.name"
                    loading="lazy"
                    class="size-9 shrink-0 rounded-md border border-zinc-200 object-cover"
                    :class="{ 'opacity-60': !child.isActive }"
                  />

                  <div
                    class="flex min-w-0 flex-1 flex-col gap-0.5"
                    :class="{ 'opacity-60': !child.isActive }"
                  >
                    <strong class="truncate">{{ child.name }}</strong>
                    <span class="text-xs text-zinc-500">
                      {{ child.productCount }} محصول
                      <template v-if="!child.isActive"> · غیرفعال</template>
                    </span>
                  </div>

                  <div class="flex gap-1.5">
                    <button
                      type="button"
                      :class="actionButton"
                      :aria-label="`ویرایش ${child.name}`"
                      @click="emit('edit', child)"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      :class="dangerButton"
                      :aria-label="`حذف ${child.name}`"
                      @click="emit('delete', child)"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <p v-if="categories.length === 0" class="mt-4 text-center text-zinc-500">
      هنوز دسته‌بندی‌ای ثبت نشده است.
    </p>
  </div>
</template>