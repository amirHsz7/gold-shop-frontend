<template>
    <div>
        {{ userStore.user?.fullName }}
    </div>
</template>
<script setup lang="ts">
const userStore = useUserStore()
</script>