import request from '@/utils/request'
import CryptoJS from 'crypto-js'

export async function fetchLogin(data: any, index: number) {
  return await request({
    method: 'POST',
    url: '/login',
    data: {
      ...data,
      password: Sha256(data.password),
    },
    remoteIndex: index,
  })
}

export function Sha256(message: string) {
  const hash = CryptoJS.SHA256(message)
  // 将散列值转换为字符串表示

  return hash.toString(CryptoJS.enc.Hex)
}
