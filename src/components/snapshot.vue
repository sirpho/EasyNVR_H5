<template>
  <img class="w-full h-full" mode="aspectFill" :src="imageData" alt=""></img>
</template>

<script setup>
import { defineProps, ref, watch, onMounted, onUnmounted } from 'vue'
import { getChannelSnapshot } from '@/services/device.ts'
import { SplicBase64String } from '@/utils/index.ts'
import { useUserStore } from '@/stores/modules/user.ts'
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  isDevice: {
    type: Boolean,
    default: true,
  },
  remoteIndex: {
    type: Number,
    default: 0,
  },
})
const userStore = useUserStore()


let timer = ref(null)

const imageData = ref(`${userStore.getRemoteUrl(props.remoteIndex)}/cloud/assets/img/noImg.png`)

const getSnapshotForChannel = () => {
  getChannelSnapshot(props.id, props.remoteIndex).then((res) => {
    if (res.img) {
      imageData.value = SplicBase64String(res.img)
    }
  })
}

onMounted(() => {
  timer.value = setInterval(() => {
    getSnapshotForChannel()
  }, 60 * 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})

// 监听 deviceId 变化，并在有值时调用 getSnapshot
watch(
  () => props.id,
  (newVal) => {
    if (newVal) {
      getSnapshotForChannel()
    }
  },
  { immediate: true }, // 组件挂载时立即执行一次
)
</script>
