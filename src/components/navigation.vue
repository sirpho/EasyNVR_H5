<template>
  <div class="navigation flex justify-center items-center bg-white w-screen">
    <nut-icon v-if="allowBack" name="left" @click="handleBack"></nut-icon>
    <div>{{ title }}</div>
    <div class="right">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    default: '',
  },
  allowBack: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const handleBack = () => {
  router.back()
}
</script>
<style scoped>
.navigation {
  box-sizing: border-box;
  padding-left: 32px;
  padding-right: 32px;
  height: 50px;
  font-weight: bold;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
}
.nut-icon-left {
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
}
.right {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  gap: 5px;
  
  display: flex;
  align-items: center;
}
</style>
