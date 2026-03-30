import request from '@/utils/request'
import { splicBaseUrlToRemoteUrl } from '@/utils/index.ts'

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
// 获取版本
export async function findVersion(index: number) {
  return await request({
    method: 'get',
    url: `/app/version`,
    params: null,
    remoteIndex: index,
  })
}
// 获取云存录像列表
export async function findRecords(index: number) {
  return await request({
    method: 'get',
    url: `/records/cloud/channels`,
    params: { page: 1, size: 200 },
    remoteIndex: index,
  })
}
// 获取有录像的日期
export async function findRecordDates(params: any, index: number) {
  return await request({
    method: 'get',
    url: `/records/months`,
    params,
    remoteIndex: index,
  })
}
// 获取录像时间轴
export async function findRecordTimeLine(params: any, index: number) {
  return await request({
    method: 'get',
    url: `/records/timeline`,
    params,
    remoteIndex: index,
  })
}
// 获取录像列表
export async function findRecordList(params: any, index: number) {
  const res = await request({
    method: 'get',
    url: `/records`,
    params,
    remoteIndex: index,
  })
  return await request({
    method: 'get',
    url: res.url,
    params: null,
    remoteIndex: index,
  })
}
