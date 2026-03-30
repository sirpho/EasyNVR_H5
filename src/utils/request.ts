import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import type { Axios, AxiosPromise } from 'axios'
import { tansParams } from '@sirpho/utils'
import { AxiosCanceler } from './axios/axiosCancel'
import { Toast } from '@nutui/nutui'
import { useUserStore } from '@/stores/modules/user.ts'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

export interface CreateAxiosOptions extends AxiosRequestConfig {
  headers?: any
  isMock?: boolean
  customize?: boolean
  carryToken?: boolean
  ignoreCancelToken?: boolean
  remoteIndex: number
}

export interface GAxiosInstance extends Axios {
  (config: CreateAxiosOptions): AxiosPromise<any>

  (url: string, config?: CreateAxiosOptions): AxiosPromise<any>
}

let loadingInstance: any

const axiosCanceler = new AxiosCanceler()

/**
 * @description 处理code异常
 * @param {*} code
 * @param {*} msg
 */
const handleCode = (code: number, msg: string) => {
  setTimeout(async () => {
    switch (code) {
      case 401:
        Toast.text(msg || '登录已过期，请重新登录')
        userStore.clearToken()
        await router.replace('/login')
        break
      default:
        Toast.text(msg || `后端接口${code}异常`)
        break
    }
  })
}
/**
 * @description axios初始化
 */
const instance: GAxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
/**
 * @description axios请求拦截器
 */
instance.interceptors.request.use(
  (config: any) => {
    const {
      headers: { ignoreCancelToken },
    } = config

    const ignoreCancel =
      ignoreCancelToken !== undefined ? ignoreCancelToken : config?.ignoreCancelToken || true
    !ignoreCancel && axiosCanceler.addPending(config)
    const remoteIndex = parseInt(config?.remoteIndex || 0)
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    config.url = userStore.getRemoteUrl(remoteIndex) + config.url

    config.headers['Authorization'] = `Bearer ${userStore.getTokenList(remoteIndex) || ''}`
    return config
  },
  (error: Error | AxiosError) => {
    return Promise.reject(error)
  },
)
/**
 * @description axios响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<any>): Promise<any> => {
    response && axiosCanceler.removePending(response.config as CreateAxiosOptions)
    if (loadingInstance) loadingInstance.close()
    const { data, config, status } = response
    const { msg = '', message = '' } = data as any
    // 是否操作正常
    if ((config as CreateAxiosOptions).customize) return data
    else if (status >= 200 && status < 300) return data
    else {
      handleCode(status, msg || message)
      return Promise.reject(false)
    }
  },
  (error: any): Promise<any> => {
    if (loadingInstance) loadingInstance.close()
    const { response, config } = error
    let errorMessage = error.message || ''
    if (error.response && error.response.data) {
      const status = response.status
      handleCode(status, errorMessage)
      return Promise.reject(errorMessage)
    } else {
      if (errorMessage === 'Network Error') {
        errorMessage = '后端接口连接异常'
      }
      if (errorMessage.includes('timeout')) {
        errorMessage = '后端接口请求超时'
      }
      if (errorMessage.includes('Request failed with status code')) {
        const code = errorMessage.substr(errorMessage.length - 3)
        errorMessage = '后端接口' + code || '' + '异常'
      }
      if (!(config as CreateAxiosOptions).customize) {
        Toast.text(errorMessage || `后端接口未知异常`)
      }
      return Promise.reject(errorMessage || `后端接口未知异常`)
    }
  },
)

const request: (opt?: CreateAxiosOptions) => Promise<any> | any = async (opt: any) =>
  await instance.request(opt)

export default request
