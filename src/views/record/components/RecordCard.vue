<template>
  <div class="rounded-lg bg-white overflow-hidden" @click="handleClick">
    <div class="p-3 flex justify-between items-center">
      <text class="w-18 truncate">
        {{ item.device_name || item.name || item.channel_id }}
      </text>
      <text
        :class="item.is_recording ? 'text-green-600' : 'text-gray-400'"
        style="white-space: nowrap"
      >
        {{ item.is_recording ? '录像中' : '未录像' }}
      </text>
    </div>
    <div style="aspect-ratio: 16 / 9" class="rounded-b-lg overflow-hidden">
      <Snapshot :id="item.channel_id" :remoteIndex="props.remoteIndex" :is-device="false" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Snapshot from '@/components/snapshot.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
  },
  remoteIndex: {
    type: Number,
  },
})

const router = useRouter()

const handleClick = () => {
  router.replace({
    name: 'recordPlay',
    query: {
      deviceId: props.item.device_id,
      channelId: props.item.channel_id,
      remoteIndex: props.remoteIndex,
    },
  })
}
</script>

<style></style>
