<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <RouterView />

  <nav v-if="route.path !== '/login'">
    <RouterLink class="link" to="/">
      <div class="menu-wrapper">预览</div>
    </RouterLink>
    <RouterLink class="link" to="/record">
      <div class="menu-wrapper">录像</div>
    </RouterLink>
    <RouterLink class="link" to="/my">
      <div class="menu-wrapper">我的</div>
    </RouterLink>
  </nav>
</template>
<style lang="scss">
@import url('/tailwind.css');
@import url('/icon/iconfont.css');
@import 'style/common.css';
</style>
<style scoped>
nav {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  height: 50px;
  border-top: 1px solid #2b2b2b;
}

.link {
  width: 33%;
}

.menu-wrapper {
  width: 100%;
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
}
</style>
