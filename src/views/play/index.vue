<template>
  <div class="page-content">
    <Navigation :title="state.name" allowBack />
    <div id="video-container" class="video-container"></div>

    <div class="content">
      <div class="steering">
        <div class="row">
          <div
            class="button top"
            @pointerdown="handlePointerDown('TOP')"
            @pointerup="handlePointerUp('TOP')"
            @pointercancel="handlePointerUp('TOP')"
          >
            <img src="https://www.easynvr.com/public/svg/up.svg" mode="widthFix" alt="" />
          </div>
        </div>
        <div class="row">
          <div
            class="button left"
            @pointerdown="handlePointerDown('LEFT')"
            @pointerup="handlePointerUp('LEFT')"
            @pointercancel="handlePointerUp('LEFT')"
          >
            <img src="https://www.easynvr.com/public/svg/left.svg" mode="widthFix" alt="" />
          </div>
          <div
            class="button right"
            @pointerdown="handlePointerDown('RIGHT')"
            @pointerup="handlePointerUp('RIGHT')"
            @pointercancel="handlePointerUp('RIGHT')"
          >
            <img src="https://www.easynvr.com/public/svg/right.svg" mode="widthFix" alt="" />
          </div>
        </div>
        <div class="row">
          <div
            class="button bottom"
            @pointerdown="handlePointerDown('BOTTOM')"
            @pointerup="handlePointerUp('BOTTOM')"
            @pointercancel="handlePointerUp('BOTTOM')"
          >
            <img src="https://www.easynvr.com/public/svg/down.svg" mode="widthFix" alt="" />
          </div>
        </div>
      </div>
      <div class="fill"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import { controlDeviceStart, controlDeviceStop } from '@/services/device.ts'
import { useRoute } from 'vue-router'
import { splicBaseUrlToRemoteUrl } from '@/utils/index.ts'
import flvjs from 'flv.js'
import Navigation from '@/components/navigation.vue'

const videoRef = ref(null)
let flvPlayer = null
const retryCount = ref(0)
const isLoading = ref(false)

const state = reactive({
  url: '',
  channelId: '',
  name: '',
  deviceId: '',
  remoteIndex: 0,
})
const route = useRoute()

const initState = () => {
  const remoteIndex = parseInt(route.query.remoteIndex || 0)
  state.url = splicBaseUrlToRemoteUrl(decodeURIComponent(route.query.url || ''), remoteIndex) || ''
  state.channelId = route.query.channelId || ''
  state.deviceId = route.query.deviceId || ''
  state.name = route.query.name || ''
  state.remoteIndex = remoteIndex
}

const getVideoContainer = () => {
  if (typeof document === 'undefined') return null
  return document.querySelector('#video-container')
}

const createVideoElement = () => {
  const container = getVideoContainer()
  if (!container) return

  if (videoRef.value) {
    videoRef.value.removeEventListener('error', handleVideoError)
    videoRef.value.remove()
    videoRef.value = null
  }

  const video = document.createElement('video')
  video.id = 'myVideo'
  video.controls = true
  video.autoplay = false
  video.muted = true
  video.playsInline = true
  video.style.cssText = 'height:100%;width:100%;object-fit:contain;'

  video.addEventListener('error', handleVideoError)
  container.appendChild(video)
  videoRef.value = video
}

// 最稳定播放配置（修复所有报错）
const initFlvPlayer = async () => {
  if (!state.url) return
  if (isLoading.value) return
  if (!flvjs || !flvjs.isSupported()) {
    console.error('不支持FLV播放')
    return
  }

  isLoading.value = true
  try {
    // 安全销毁
    if (flvPlayer) {
      flvPlayer.pause()
      flvPlayer.unload()
      flvPlayer.destroy()
      flvPlayer = null
      await new Promise((r) => setTimeout(r, 100))
    }

    flvPlayer = flvjs.createPlayer(
      {
        type: 'flv',
        url: state.url,
        isLive: true,
        hasVideo: true,
        hasAudio: false,
      },
      {
        enableWorker: false,
        lazyLoad: false,
        maxBufferLength: 0,
        maxMaxBufferLength: 1,
        autoCleanupSourceBuffer: true,
        deferLoadAfterSourceOpen: false,
      },
    )

    flvPlayer.attachMediaElement(videoRef.value)
    flvPlayer.load()

    // 安全播放
    setTimeout(() => {
      flvPlayer.play().catch((err) => {
        console.log('静音播放')
        videoRef.value.muted = true
        flvPlayer.play().catch(() => {})
      })
    }, 200)

    flvPlayer.on(flvjs.ErrorTypes.ERROR, handleVideoError)
  } catch (e) {
    console.error('初始化失败', e)
  } finally {
    isLoading.value = false
  }
}

// 错误处理（防崩溃）
const handleVideoError = (err) => {
  console.error('播放错误', err)
  if (retryCount.value >= 3) {
    console.error('播放失败，请检查视频地址是否为FLV格式')
    retryCount.value = 0
    return
  }
  retryCount.value++

  setTimeout(() => {
    createVideoElement()
    initFlvPlayer()
  }, 1500)
}

watch(
  () => state.url,
  () => {
    retryCount.value = 0
    createVideoElement()
    initFlvPlayer()
  },
)

onMounted(() => {
  initState()
  if (typeof document !== 'undefined') {
    createVideoElement()
    if (state.url) initFlvPlayer()
  }
})

onUnmounted(() => {
  try {
    if (flvPlayer) {
      flvPlayer.pause()
      flvPlayer.unload()
      flvPlayer.destroy()
      flvPlayer = null
    }
    if (videoRef.value) {
      videoRef.value.remove()
      videoRef.value = null
    }
  } catch (e) {}
})

// 云台控制
const handlePointerDown = (direction) => startPTZControl(55, direction)
const handlePointerUp = (direction) => stopPTZControl(55, direction)

const getPTZData = (speed, direction) => ({
  deviceId: state.deviceId,
  speed,
  direction,
  channel_id: state.channelId,
})
const startPTZControl = (speed, direction) => {
  controlDeviceStart(getPTZData(speed, direction), state.remoteIndex)
}
const stopPTZControl = (speed, direction) => {
  controlDeviceStop(getPTZData(speed, direction), state.remoteIndex)
}
</script>

<style scoped>
.page-content {
  margin: 0 auto;
  background-color: #f5f5f5;
}
.video-container {
  margin: 0 auto;
  aspect-ratio: 16/9;
  background-color: #000;
  padding: 4px 0;
}
.content {
  padding: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
  position: relative;
}
.fill {
  width: 200px;
  height: 200px;
  background: #fff;
  box-shadow: 0 7px 29px rgba(100, 100, 111, 0.2);
  position: absolute;
  z-index: 0;
  border-radius: 50%;
}
.steering {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  position: relative;
  z-index: 10;
}
.row {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 50px;
  position: relative;
}
.button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: absolute;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.button:active {
  transform: scale(0.9);
  background: #f0f0f0;
}
.top {
  top: -30px;
}
.left {
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
}
.right {
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
}
.bottom {
  bottom: -30px;
}
</style>
