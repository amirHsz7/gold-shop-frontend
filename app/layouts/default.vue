<template>
  <div dir="rtl" class="flex min-h-screen flex-col bg-cream font-sans text-dark-brown">
    <SiteAnnouncementBar />
    <SiteHeader />

    <main class="flex-1">
      <slot />
    </main>

    <SiteFooter />
    <SiteMobileBottomNav />
    <SiteScrollTop />
  </div>
</template>