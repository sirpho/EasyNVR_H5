<template>
  <div class="page-content">
    <Navigation title="我的" />
    <div class="p-3">
      <!-- 顶部用户头像信息 -->
      <div class="p-3 bg-white rounded-lg mb-3">
        <div class="font-semibold text-xl">登录信息</div>
        <div v-for="item of userInfoList" :key="item.remoteIndex">
          <div class="text-sm text-gray-400 flex items-center">
            <span class="pr-1">远程地址</span>
            <span>
              {{ item.url }}
            </span>
          </div>
          <div class="text-sm text-gray-400 flex items-center">
            <span class="pr-1">服务器版本 {{ item.serverVersion }}</span>
          </div>
          <div class="h-5"></div>
        </div>

        <div class="font-semibold text-xl">版本信息</div>
        <div class="text-sm text-gray-400 flex items-center my-1">
          <span class="pr-1">H5版本 v{{ version }}</span>
        </div>
      </div>

      <div>
        <div
          class="p-3 rounded-lg flex justify-between items-center"
          style="background-color: #f5222d; color: #fff"
          @click="handeLogout"
        >
          <span class="font-semibold">退出登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user.ts'
import packageJSON from '../../../package.json'
import { findVersion } from '@/services/device.ts'
import { useRouter } from 'vue-router'
import Navigation from '@/components/navigation.vue'

const userStore = useUserStore()
const userInfoList = ref([])
const router = useRouter()

const version = ref('')

onMounted(() => {
  version.value = packageJSON.version
  findUserInfo()
})

// 获取用户信息
const findUserInfo = async () => {
  const list = userStore.getLoginList()

  for (const item of list) {
    const res = await findVersion(item.remoteIndex).catch((err) => {
      console.log('>>请求错误>>', err)
    })
    item.serverVersion = res.version
  }
  userInfoList.value = list
}

const handeLogout = () => {
  userStore.clearToken()
  userStore.clearToken()
  router.replace('/login')
}
</script>
