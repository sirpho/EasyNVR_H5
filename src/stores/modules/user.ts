import { defineStore } from 'pinia'
import { store } from '@/stores'
import { reactive, toRefs } from 'vue'

interface UserState {
  tokenList: string[]
  loginList: any[]
  userList: any[]
}

export const useUserStore = defineStore('user', () => {
  const state = reactive<UserState>({
    tokenList: [],
    loginList: [],
    userList: [],
  })

  const setTokenList = (tokenList: string[]) => {
    state.tokenList = tokenList
  }
  const setLoginList = (loginList: string[]) => {
    state.loginList = loginList
  }
  const setUserList = (userList: string[]) => {
    state.userList = userList
  }
  const clearToken = () => {
    state.tokenList = []
  }
  const getTokenList = (index: number) => {
    return state.tokenList[index]
  }
  const getLoginList = () => {
    return state.loginList || []
  }
  const getRemoteUrl = (index: number) => {
    return (state.loginList[index] || []).url
  }

  return {
    ...toRefs(state),
    setTokenList,
    getTokenList,
    clearToken,
    getRemoteUrl,
    setLoginList,
    getLoginList,
    setUserList,
  }
})

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store)
}
