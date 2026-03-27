/**
 * Pinia Persist Plugin
 * Pinia 持久化插件
 * @link https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/
 *
 */
import type { Pinia } from 'pinia'
import { createPersistedState, type Serializer } from 'pinia-plugin-persistedstate'
import { type Encryption, EncryptionFactory } from '@/utils/cipher'

const PERSIST_KEY_PREFIX = 'NVR'

const cacheCipher = {
  key: '_11111000001111@',
  iv: '@11111000001111_',
}
const persistEncryption: Encryption = EncryptionFactory.createAesEncryption({
  key: cacheCipher.key,
  iv: cacheCipher.iv,
})

/**
 * Custom serializer for serialization and deserialization of storage data
 * 自定义序列化器，用于序列化和反序列化存储数据
 *
 * @returns serializer
 */
function customSerializer(): Serializer {
  return {
    deserialize: (value) => {
      return JSON.parse(value)
    },
    serialize: (value) => {
      return JSON.stringify(value)
    },
  }
}

/**
 * Register Pinia Persist Plugin
 * 注册 Pinia 持久化插件
 *
 * @param pinia Pinia instance Pinia 实例
 */
export function registerPiniaPersistPlugin(pinia: Pinia) {
  pinia.use(createPersistedState(createPersistedStateOptions(PERSIST_KEY_PREFIX)))
}

/**
 * Create Persisted State Options
 * 创建持久化状态选项
 *
 * @param keyPrefix prefix for storage key 储存键前缀
 * @returns persisted state factory options
 */
export function createPersistedStateOptions(keyPrefix: string): any {
  return {
    storage: localStorage,
    key: (id: any) => `${keyPrefix}__${id}`,
    serializer: customSerializer(),
  }
}
