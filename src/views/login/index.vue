<template>
  <div class="login-page">
    <!-- 顶部logo区域 -->
    <div class="logo-wrap">
      <img class="logo-img" src="/logo.png" alt="" />
      <div class="text-xl pt-2">MultiNVR</div>
    </div>

    <!-- 表单列表：垂直流式排列 -->
    <div class="form-list-container">
      <!-- 循环渲染所有表单 -->
      <div class="form-card" v-for="(form, index) in formList" :key="index">
        <div class="form-title">登录配置 {{ index + 1 }}</div>

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

      <!-- 新增配置按钮 -->
      <div class="add-form-wrap">
        <div class="add-form-btn" @click="addNewForm()">+ 新增登录配置</div>
      </div>
    </div>

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
const loading = ref(false)

// 页面挂载时初始化表单数据
onMounted(() => {
  if (userStore.getTokenList[0]) {
    router.replace('/')
  } else {
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
}

// 删除表单
const deleteForm = (index) => {
  formList.value.splice(index, 1)
}

// 获取完整URL
const getFullUrl = (domain) => {
  if (!domain) return ''
  if (!domain.startsWith('http')) {
    return 'http://' + domain
  }
  return domain
}

// 单个地址登录
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

// 登录方法
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
  userStore.setLoginList(result)

  const res = await Promise.all(result.map((item, index) => loginSingle(item, index))).catch(
    (err) => {
      let msg = err.msg || err.errMsg || '登录失败，请检查您的服务地址是否正确'
      Toast.text(msg)
      loading.value = false
      return
    },
  )

  if (!res) return

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
  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 120px;
}

/* Logo区域 */
.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px 0 40px;
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

/* 表单列表容器：垂直流式 */
.form-list-container {
  width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 表单卡片 */
.form-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 28px 20px;
  position: relative;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
}

/* 表单标题 */
.form-title {
  font-size: 30px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
}

/* 输入框 */
.form-item input {
  width: 100%;
  height: 60px;
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

/* 删除按钮 */
.form-item.del-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 8px;
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

/* 新增按钮 */
.add-form-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}

.add-form-btn {
  width: 420px;
  height: 40px;
  line-height: 40px;
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

/* 登录按钮 */
.login-btn-wrap {
  width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  position: fixed;
  bottom: 40px;
  left: 0;
}

.login-btn {
  width: 100%;
  height: 50px;
  line-height: 50px;
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
