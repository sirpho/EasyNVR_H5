<template>
  <div class="page-content pt-24">
    <!-- 顶部logo区域 -->
    <div class="logo-wrap">
      <img class="logo-img" src="/logo.png" alt="" />
      <div class="text-xl pt-2">MultiNVR</div>
    </div>

    <!-- swiper滑动容器 -->
    <nut-swiper
      :init-page="currentFormIndex"
      :pagination-visible="true"
      pagination-color="#426543"
      auto-play="0"
      class="form-swiper"
      :current="currentFormIndex"
      :is-prevent-default="false"
      :is-stop-propagation="false"
    >
      <!-- 已有表单项 -->
      <nut-swiper-item v-for="(form, index) in formList" :key="index">
        <div class="form-card">
          <div class="form-item">
            <input v-model="form.domain" placeholder="请输入 IP/域名 地址" />
          </div>
          <div class="form-item">
            <input v-model="form.username" placeholder="账号" />
          </div>
          <div class="form-item">
            <input v-model="form.password" placeholder="密码" type="password" />
          </div>
          <div v-if="formList.length > 1" class="form-item del-button-wrapper">
            <button class="del-button" @click="deleteForm(index)">删除</button>
          </div>
        </div>
      </nut-swiper-item>

      <!-- 新增表单占位页 -->
      <nut-swiper-item>
        <div class="add-form-wrap">
          <div class="add-form-btn" @click="addNewForm()">+ 新增登录配置</div>
        </div>
      </nut-swiper-item>
    </nut-swiper>

    <!-- 登录按钮 -->
    <div class="login-btn-wrap">
      <button class="login-btn" :disabled="loading" @click="login()">登 录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user.ts'
import { fetchLogin } from '@/services/login.ts'
import { Toast } from '@nutui/nutui'

const userStore = useUserStore()
const router = useRouter()
const formList = ref([
  {
    domain: '',
    username: '',
    password: '',
    wifiNames: '',
    wifiDomain: '',
  },
])
// 当前激活的表单索引
const currentFormIndex = ref(0)
const loading = ref(false)

// 页面挂载时初始化表单数据
onMounted(() => {
  if (userStore.getTokenList[0]) {
    router.replace('/')
  } else {
    // 从本地缓存加载登录信息到表单
    const loginList = userStore.getLoginList()
    if (loginList.length > 0) {
      formList.value = [...loginList]
    }
  }
})

// 新增表单
const addNewForm = () => {
  formList.value.push({
    domain: '',
    username: '',
    password: '',
  })
  // 新增后自动切换到新表单
  currentFormIndex.value = formList.value.length - 1
}

// 删除表单
const deleteForm = (index) => {
  formList.value.splice(index, 1)
  currentFormIndex.value = Math.max(0, currentFormIndex.value - 1)
}

// 获取完整URL
const getFullUrl = (domain) => {
  if (!domain) return ''
  if (!domain.startsWith('http')) {
    return 'http://' + domain
  }
  return domain
}

/**
 * 单个地址登录
 * @param params
 * @param index
 * @returns {Promise<unknown>}
 */
const loginSingle = (params, index) => {
  return new Promise((resolve, reject) => {
    fetchLogin(params, index)
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
//
// // 登录方法（接收表单索引）
const login = async () => {
  for (let i = 0; i < formList.value.length; i++) {
    const item = formList.value[i]
    if (!item.domain) {
      Toast.text(`请输入配置${i + 1}的服务器地址`)
      return
    }
    if (!item.username) {
      Toast.text(`请输入配置${i + 1}的账号`)
      return
    }
    if (!item.password) {
      Toast.text(`请输入配置${i + 1}的密码`)
      return
    }
  }
  const result = formList.value.map((item, index) => ({
    url: getFullUrl(item.domain),
    domain: item.domain,
    username: item.username,
    password: item.password,
    remoteIndex: index,
  }))

  loading.value = true
  // 保存当前表单的登录信息到本地
  userStore.setLoginList(result)

  const res = await Promise.all(result.map((item, index) => loginSingle(item, index)))
    .catch((err) => {
      let msg = err.msg || err.errMsg || '登录失败，请检查您的服务地址是否正确'
      Toast.text(msg)
    })
    .finally(() => {
      loading.value = false
    })
  const tokenResult = res.map((item) => item.token)
  userStore.setTokenList(tokenResult)
  userStore.setUserList(
    res.map((item, index) => ({
      ...item.user,
      url: result[index]?.url,
      remoteIndex: result[index]?.remoteIndex,
      wifiUrl: result[index]?.wifiUrl,
      wifiNames: result[index]?.wifiNames,
      wifiDomain: result[index]?.wifiDomain,
    })),
  )
  await router.replace('/')
}
</script>

<style scoped>
/* 根容器：控制整体布局 */
.page-content {
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
}

/* Logo区域：居中，距离顶部有间距 */
.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px 0 60px;
  color: #007aff;
}

.logo-img {
  width: 96px;
  height: 96px;
  border-radius: 20px;
  object-fit: contain;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.logo-wrap .text-xl {
  font-size: 36px;
  font-weight: 600;
  color: #333;
  margin-top: 16px;
}

/* swiper 容器 */
.form-swiper {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}

/* 表单卡片：更精致 */
.form-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px 18px;
  position: relative;
  box-sizing: border-box;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 输入框统一美化 */
.form-item input {
  width: 100%;
  height: 88px;
  padding: 0 24px;
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  font-size: 28px;
  color: #333;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.form-item input:focus {
  border-color: #007aff;
  background: #ffffff;
  outline: none;
}

/* 删除按钮区域 */
.form-item.del-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.del-button {
  width: 320px;
  height: 72px;
  line-height: 72px;
  font-size: 26px;
  color: #fa4d4d;
  background: #fff1f0;
  border: 2px solid #ffe0e0;
  border-radius: 36px;
  transition: all 0.2s ease;
}

.del-button:active {
  background: #ffe0e0;
}

/* 新增表单容器：完全居中 */
.add-form-wrap {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 新增按钮样式 */
.add-form-btn {
  width: 420px;
  height: 88px;
  line-height: 88px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 44px;
  font-size: 30px;
  font-weight: 500;
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.2);
  transition: all 0.2s ease;
  text-align: center;
}

/* 登录按钮容器：固定底部 */
.login-btn-wrap {
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 60px;
  left: 24px;
  right: 24px;
  z-index: 99;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  max-width: 600px;
  height: 92px;
  line-height: 92px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 46px;
  font-size: 34px;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 122, 255, 0.25);
  transition: all 0.2s ease;
}

.login-btn:disabled {
  background: #c0d6f2;
  box-shadow: none;
  color: #eaf2fc;
}

.login-btn:active:not(:disabled) {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>
