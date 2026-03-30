<template>
  <view>
    <div>
      <nut-skeleton v-if="loading" width="100%" height="15px" title animated row="5" />
      <div v-else :class="`grid ${gridCols} gap-2 p-3 items-stretch`">
        <RecordCard
          v-for="item in recordData"
          :key="item.channel_id + '@' + item.remoteIndex"
          :item="item"
          :deviceId="item.deviceId"
          :remoteIndex="item.remoteIndex"
        />
      </div>
    </div>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import RecordCard from './components/RecordCard.vue'
import { findRecords } from '@/services/device.ts'
import { useUserStore } from '@/stores/modules/user.ts'

// 设备列表
const recordData = ref([])

const gridCols = ref('grid-cols-2')

const loading = ref(false) // 初次加载骨架屏状态
const refresherTriggered = ref(false)
const userStore = useUserStore()

onMounted(() => {
  findRecordList()
})
// 下拉刷新逻辑
const onRefresh = async () => {
  refresherTriggered.value = true
  await findRecordList()
  // 给刷新动画留出时间
  await new Promise((resolve) => setTimeout(resolve, 500))
  refresherTriggered.value = false
}
/**
 * 获取设备列表
 */
const findRecordList = async () => {
  loading.value = true
  const loginList = userStore.getLoginList()
  const itemList = []

  for (const item of loginList) {
    const res = await findRecords(item.remoteIndex)
    const items = res.items.map((ite) => ({
      ...ite,
      remoteIndex: item.remoteIndex,
    }))
    itemList.push(...items)
  }

  recordData.value = itemList
  loading.value = false
}

const handleSwitch = () => {
  if (gridCols.value === 'grid-cols-2') {
    gridCols.value = 'grid-cols-1'
  } else {
    gridCols.value = 'grid-cols-2'
  }
}
</script>
