import request from '@/utils/request'

export async function fetchDevice(params: any, index: number) {
  return await request({
    method: 'get',
    url: '/devices',
    params,
    remoteIndex: index,
  })
}

export async function controlDeviceStart(data: any, index: number) {
  return await request({
    method: 'post',
    url: `/devices/${data.deviceId}/ptz/start`,
    data,
    remoteIndex: index,
  })
}

export async function controlDeviceStop(data: any, index: number) {
  return await request({
    method: 'post',
    url: `/devices/${data.deviceId}/ptz/stop`,
    data,
    remoteIndex: index,
  })
}
// 获取通道列表
export async function findChannels(params: any, index: number) {
  return await request({
    method: 'get',
    url: `/channels`,
    params,
    remoteIndex: index,
  })
}
// 获取快照
export async function getChannelSnapshot(id: any, index: number) {
  return await request({
    method: 'post',
    url: `/channels/${id}/snapshot`,
    params: {
      h: 70,
      time_s: 0,
    },
    remoteIndex: index,
  })
}
// 直播
export async function getLive(id: any, index: number) {
  return await request({
    method: 'post',
    url: `/channels/${id}/play`,
    data: {},
    remoteIndex: index,
  })
}
