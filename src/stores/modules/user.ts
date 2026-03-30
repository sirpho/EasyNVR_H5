import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    // 使用 ref 代替 reactive
    const tokenList = ref<string[]>([])
    const loginList = ref<any[]>([])
    const userList = ref<any[]>([])
    const gridClos = ref<string>('grid-cols-2')

    const setTokenList = (newTokenList: string[]) => {
      tokenList.value = newTokenList
    }

    const setLoginList = (newLoginList: any[]) => {
      loginList.value = newLoginList
    }

    const setUserList = (newUserList: any[]) => {
      userList.value = newUserList
    }

    const clearToken = () => {
      tokenList.value = []
      userList.value = []
    }

    const getTokenList = (index: number) => {
      return tokenList.value[index]
    }

    const getLoginList = () => {
      return loginList.value || []
    }

    const getRemoteUrl = (index: number) => {
      return (loginList.value[index] || {}).url
    }

    const setGridClos = (grid: string) => {
      gridClos.value = grid
    }

    const getGridClos = () => {
      return gridClos.value
    }

    return {
      tokenList,
      loginList,
      userList,
      setTokenList,
      getTokenList,
      clearToken,
      getRemoteUrl,
      setLoginList,
      getLoginList,
      setUserList,
      setGridClos,
      getGridClos,
    }
  },
  {
    persist: true,
  },
)
