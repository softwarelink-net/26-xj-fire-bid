<template>
  <header class="global-sticky-top-banner" role="banner">
    <div class="banner-content">
      <span class="banner-badge">智慧安防</span>
      <span class="banner-text">
        获取网站源码，请访问：
        <a
          href="https://github.com/softwarelink-net/26-xj-fire-bid"
          target="_blank"
          rel="noopener noreferrer"
          class="banner-link"
        >
          https://github.com/softwarelink-net/26-xj-fire-bid
        </a>
      </span>
    </div>
  </header>
</template>

<style scoped>
.global-sticky-top-banner {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 40px !important;
  z-index: 9999 !important;
  background: linear-gradient(90deg, #991b1b 0%, #b91c1c 50%, #7f1d1d 100%);
  color: #fef2f2;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.banner-badge {
  background: #f87171;
  color: #450a0a;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}
.banner-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(92vw, 920px);
}
.banner-link {
  color: #fecaca;
  text-decoration: underline;
  margin-left: 4px;
  transition: color 0.2s ease;
}
.banner-link:hover {
  color: #ffffff;
}
</style>
