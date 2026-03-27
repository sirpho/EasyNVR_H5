<template>
  <view>
    <div>
      <nut-skeleton v-if="loading" width="100%" height="15px" title animated row="5" />
      <div v-else :class="`grid ${gridCols} gap-2 p-3 items-stretch`">
        <ChannelCard
          v-for="item in channelList"
          :key="item.id + '@' + item.remoteIndex"
          :item="item"
          :deviceId="item.deviceId"
        />
      </div>
    </div>
  </view>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import ChannelCard from './components/ChannelCard.vue'
import { findChannels, fetchDevice } from '@/services/device.ts'
import { useUserStoreWithOut } from '@/stores/modules/user.ts'

// 设备列表
const deviceList = ref([])
// 通道列表
const channelList = ref([])

const gridCols = ref('grid-cols-2')

const loading = ref(false) // 初次加载骨架屏状态
const refresherTriggered = ref(false)
const titleHeight = ref(0)
const user = useUserStoreWithOut()

// 分页参数
const pagination = reactive({
  page: 1,
  size: 30,
  id: '',
  status: '',
  name: '',
  is_platform: '',
  protocol: '',
})

onMounted(() => {
  findDeviceList()
})
// 下拉刷新逻辑
const onRefresh = async () => {
  refresherTriggered.value = true
  await findDeviceList()
  // 给刷新动画留出时间
  await new Promise((resolve) => setTimeout(resolve, 500))
  refresherTriggered.value = false
}
/**
 * 获取设备列表
 */
const findDeviceList = async () => {
  loading.value = true
  const loginList = user.getLoginList()
  const itemList = []

  for (const item of loginList) {
    const res = await fetchDevice(pagination, item.remoteIndex)
    const items = res.items.map((ite) => ({
      ...ite,
      remoteIndex: item.remoteIndex,
    }))
    itemList.push(...items)
  }

  deviceList.value = itemList
  await getChannelList()
}

/**
 * 查询通道列表
 */
const getChannelList = async () => {
  const channels = []
  for (const device of deviceList.value) {
    const res = await findChannels(
      {
        page: 1,
        size: 10,
        device_id: device.id,
        pid: 'ROOT',
        status: '',
        name: '',
        bid: '',
      },
      device.remoteIndex,
    )
    channels.push(
      ...res.items.map((item) => ({
        ...item,
        remoteIndex: device.remoteIndex,
        deviceId: device.id,
        deviceName: device.name,
      })),
    )
  }
  channelList.value = channels

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
