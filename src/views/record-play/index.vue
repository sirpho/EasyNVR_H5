<template>
  <div class="page-content">
    <Navigation :title="state.name" allowBack />
    <div class="wrapper">
      <!-- 视频区域 -->
      <div class="video-container">
        <video
          crossorigin="anonymous"
          :src="processedVideoUrl"
          id="video"
          controls
          autoplay
          style="width: 100%; height: 100%"
          @error="handleVideoError"
          @timeupdate="onTimeUpdate"
        ></video>
      </div>

      <div class="bottom-container">
        <!-- 日历区域 -->
        <div class="calendarContainer">
          <div class="monthDropdown">
            <div class="selected" @click="toggleDropdown">{{ selectedMonth }}月</div>
            <div class="dropdownList" v-show="dropdownVisible">
              <div v-for="year in years" :key="year">
                <div
                  v-for="m in 12"
                  :key="year + '-' + m"
                  class="dropdownItem"
                  @click="selectMonth(year, m)"
                >
                  {{ year % 100 }}年{{ m }}月
                </div>
              </div>
            </div>
          </div>

          <div class="dateList">
            <div
              v-for="item in sortedDateData"
              :key="item.value"
              class="dateItem"
              :class="{ active: recordDay === item.value }"
              @click="selectDate(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 时间轴区域 -->
        <div class="timeline-wrapper">
          <div class="scroll-container" ref="scrollView" @click="handleContainerClick">
            <div class="timeline-content" :style="{ height: timelineHeight + 'px' }">
              <!-- 录像片段（最高层级，蓝色） -->
              <div class="segments-container">
                <div
                  v-for="(seg, index) in segments"
                  :key="index"
                  class="segment"
                  :style="getSegmentStyle(seg)"
                ></div>
              </div>

              <!-- 中心基准线 -->
              <div class="center-line"></div>

              <!-- 时间刻度 -->
              <div class="ticks-container">
                <div
                  v-for="m in ticks"
                  :key="m"
                  class="tick"
                  :style="{ top: m * pxPerMinute + 'px' }"
                >
                  <div v-if="m % 60 === 0" class="tick-line major">
                    <text class="tick-label">{{ formatTickLabel(m) }}</text>
                  </div>
                  <div v-else class="tick-line minor"></div>
                </div>
              </div>

              <!-- 拖拽 marker -->
              <div
                class="marker"
                :style="markerStyle"
                ref="marker"
                @mousedown.stop="onMarkerMouseDown"
                @mousemove.stop="onMarkerMouseMove"
                @mouseup.stop="onMarkerMouseUp"
                @mouseleave.stop="onMarkerMouseUp"
              >
                <div class="marker-bubble">{{ formatTime(handlebarTime) }}</div>
                <div class="marker-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { splicBaseUrlToRemoteUrl } from '@/utils/index.ts'
import { findRecordDates, findRecordList, findRecordTimeLine } from '@/services/device.ts'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import Navigation from '@/components/navigation.vue'

const route = useRoute()

const state = reactive({
  channelId: '',
  deviceId: '',
  name: '',
  remoteIndex: 0,
})

const scrollView = ref(null)
const recordMonth = ref(dayjs().format('YYYYMM'))
const startTime = ref(dayjs().startOf('day'))
const endTime = ref(dayjs().endOf('day'))

const videoUrls = ref([])
const currentIndex = ref(0)
const seekTime = ref(0)

const processedVideoUrl = computed(() => {
  return splicBaseUrlToRemoteUrl(videoUrls.value[currentIndex.value], parseInt(state.remoteIndex))
})

onMounted(() => {
  if (route.query) {
    state.channelId = route.query.channelId
    state.deviceId = route.query.deviceId
    state.name = route.query.name
    state.remoteIndex = parseInt(route.query.remoteIndex || 0)
  }
  getRecordDays()
})

// 播放进度
const onTimeUpdate = (e) => {
  const currentTime = Math.ceil(e.target.currentTime)
  const duration = Math.floor(e.target.duration)
  if (currentTime >= duration) {
    if (currentIndex.value < videoUrls.value.length - 1) {
      currentIndex.value++
      seekTime.value = 0
    } else {
      alert('已播放完所有视频')
    }
  }
}

// 解析视频文件名时间
const parseStartTime = (str) => {
  return new Date(
    str.substr(0, 4),
    parseInt(str.substr(4, 2)) - 1,
    str.substr(6, 2),
    str.substr(8, 2),
    str.substr(10, 2),
    str.substr(12, 2),
  ).getTime()
}

const findMatchingIndex = (targetTime) => {
  const targetDate = new Date(targetTime).getTime()
  for (let i = 0; i < videoUrls.value.length; i++) {
    const match = videoUrls.value[i].match(/\/(\d{14})-(\d+)\.mp4(?:\?|$)/)
    if (!match) continue
    const [_, startStr, duration] = match
    const startDate = parseStartTime(startStr)
    const endDate = startDate + parseInt(duration, 10)
    if (targetDate >= startDate && targetDate < endDate) {
      return {
        index: i,
        offset: Math.floor((targetDate - startDate) / 1000),
      }
    }
  }
  return { index: -1, offset: 0 }
}

const updatePlayback = (time) => {
  const result = findMatchingIndex(time)
  if (result.index === -1) return
  currentIndex.value = result.index
  seekTime.value = result.offset

  const video = document.getElementById('video')
  if (video) video.currentTime = seekTime.value
}

// 日历
const currentYear = dayjs().year()
const lastYear = currentYear - 1
const years = ref([currentYear, lastYear])
const currentMonth = dayjs().month() + 1

const selectedYear = ref(currentYear)
const selectedMonth = ref(currentMonth)
const dropdownVisible = ref(false)
const dateData = ref([])
const recordDay = ref('')

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const selectMonth = (year, month) => {
  selectedYear.value = year
  selectedMonth.value = month
  dropdownVisible.value = false
  recordMonth.value = `${year}${month.toString().padStart(2, '0')}`
  getRecordDays()
}

const sortedDateData = computed(() => {
  return dateData.value.slice().sort((a, b) => parseInt(b.value) - parseInt(a.value))
})

const selectDate = (item) => {
  recordDay.value = item.value
  const dayMoment = dayjs(item.value + '', 'YYYYMMDD', true)
  startTime.value = dayMoment.startOf('day')
  endTime.value = dayMoment.endOf('day')
  getRecordTimeline()
  getRecordList()
}

// 获取日期
const getRecordDays = async () => {
  const data = {
    channel_id: state.channelId,
    source: 'CLOUD',
    dates: recordMonth.value,
  }
  const res = await findRecordDates(data, state.remoteIndex)
  const result = []
  for (const [key, days] of Object.entries(res)) {
    for (let i = 0; i < days.length; i++) {
      if (days[i] === '1') {
        const date = i + 1
        const paddedDate = date.toString().padStart(2, '0')
        result.push({
          name: date,
          value: parseInt(`${key}${paddedDate}`),
        })
      }
    }
  }

  if (!result.length) {
    dateData.value = []
    return
  }
  dateData.value = result
  recordDay.value = result[result.length - 1].value

  startTime.value = dayjs(recordDay.value + '', 'YYYYMMDD', true).startOf('day')
  endTime.value = dayjs(recordDay.value + '', 'YYYYMMDD', true).endOf('day')
  await getRecordTimeline()
  await getRecordList()
}

// 时间轴数据
const getRecordTimeline = async () => {
  const data = {
    channel_id: state.channelId,
    source: 'CLOUD',
    start: dayjs(startTime.value).valueOf(),
    end: dayjs(endTime.value).valueOf(),
  }
  const res = await findRecordTimeLine(data, state.remoteIndex).catch(() => {})
  intervalArray.value = calculateSegments(res?.items || [])
}

// 视频列表
const getRecordList = async () => {
  const data = {
    channel_id: state.channelId,
    source: 'CLOUD',
    start: dayjs(startTime.value).valueOf(),
    end: dayjs(endTime.value).valueOf(),
    ssrc: new Date().getTime(),
  }

  const res = await findRecordList(data, state.remoteIndex).catch(() => {})
  if (res?.items) {
    videoUrls.value = res.items
    const len = videoUrls.value.length
    if (len > 0) {
      currentIndex.value = Math.min(Math.floor((len * 2) / 3), len - 1)
    }
  }
}

const handleVideoError = () => {
  if (currentIndex.value < videoUrls.value.length - 1) {
    currentIndex.value++
    seekTime.value = 0
  }
}

// ==============================================
// 时间轴核心逻辑
// ==============================================
const intervalArray = ref([])
const handlebarTime = ref(60 * 8) // 默认 08:00
const isDragging = ref(false)

const HOURS = 24
const PX_PER_HOUR = 120
const pxPerMinute = computed(() => PX_PER_HOUR / 60)
const timelineHeight = computed(() => HOURS * PX_PER_HOUR)
const TOTAL_MINUTES = 24 * 60

// 刻度：每15分钟一个
const ticks = computed(() => {
  const arr = []
  for (let m = 0; m <= TOTAL_MINUTES; m += 15) arr.push(m)
  return arr
})

// 解析录像区间数据
const segments = computed(() => {
  return intervalArray.value.map((item) => ({
    start: parseTimeStr(item.beginTime),
    end: parseTimeStr(item.endTime),
  }))
})

function parseTimeStr(timeStr) {
  const [h = 0, m = 0, s = 0] = timeStr?.split(':').map(Number)
  return h * 60 + m + s / 60
}

// 时间格式化
function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatTickLabel(m) {
  return formatTime(m)
}

// 片段样式（修复：按正常时间顺序定位）
function getSegmentStyle(seg) {
  const top = seg.start * pxPerMinute.value
  const height = (seg.end - seg.start) * pxPerMinute.value
  return {
    top: top + 'px',
    height: Math.max(height, 2) + 'px',
  }
}

// marker 定位
const markerStyle = computed(() => {
  const top = handlebarTime.value * pxPerMinute.value
  return {
    top: top + 'px',
    transform: 'translateY(-50%)',
  }
})

// marker 拖拽
const updateMarker = debounce(() => {
  const time = dayjs(
    `${recordDay.value} ${formatTime(handlebarTime.value)}`,
    'YYYYMMDD HH:mm',
  ).format('YYYY-MM-DD HH:mm:ss')
  updatePlayback(time)
}, 150)

function onMarkerMouseDown() {
  isDragging.value = true
}
function onMarkerMouseMove(e) {
  if (!isDragging.value) return
  handleDragMove(e.clientY)
}
function onMarkerMouseUp() {
  isDragging.value = false
}

function handleDragMove(clientY) {
  const el = scrollView.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const y = clientY - rect.top + el.scrollTop
  const minutes = y / pxPerMinute.value

  handlebarTime.value = Math.max(0, Math.min(TOTAL_MINUTES, minutes))
  updateMarker()
}

function handleContainerClick(e) {
  handleDragMove(e.clientY)
}

// 防抖
function debounce(func, wait) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), wait)
  }
}
function within60Seconds(timestamp1, timestamp2) {
  // 时间戳是毫秒，60秒 = 60 * 1000
  const difference = Math.abs(timestamp1 - timestamp2)
  return difference <= 60 * 1000 // 这里原来写成 10000（10秒），错误！
}
function formatSegment(startTimestamp, endTimestamp) {
  // 注意：recordDay 应该是一个 "YYYYMMDD" 格式的字符串，代表当前日期
  const todayStart = dayjs(recordDay.value + '', 'YYYYMMDD', true).startOf('day')
  const todayEnd = dayjs(recordDay.value + '', 'YYYYMMDD', true).endOf('day')
  let startMoment = dayjs(startTimestamp)
  let endMoment = dayjs(endTimestamp)

  // 如果开始时间早于当天开始，则修正为当天开始时间
  if (startMoment.isBefore(todayStart)) {
    startMoment = todayStart.clone()
  }

  // 如果结束时间晚于当天结束，则修正为当天结束时间，即 23:59:59
  if (endMoment.isAfter(todayEnd)) {
    endMoment = todayEnd.clone()
  }

  return {
    beginTime: startMoment.format('HH:mm:ss'),
    endTime: endMoment.format('HH:mm:ss'),
  }
}

// 计算时间轴区间
function calculateSegments(data) {
  if (!data || data.length === 0) return []

  // 第一步：按开始时间排序
  const sortedItems = [...data].sort((a, b) => a.start - b.start)
  const segments = []

  // 初始化第一个片段
  let currentStart = sortedItems[0].start
  let currentEnd = sortedItems[0].start + sortedItems[0].duration

  for (let i = 1; i < sortedItems.length; i++) {
    const item = sortedItems[i]
    const itemStart = item.start
    const itemEnd = item.start + item.duration

    // 判断：上一段结束 和 下一段开始 间隔 ≤60秒 → 合并
    if (within60Seconds(currentEnd, itemStart)) {
      // 合并：延长结束时间
      currentEnd = Math.max(currentEnd, itemEnd)
    } else {
      // 不连续，保存当前片段
      segments.push(formatSegment(currentStart, currentEnd))
      // 开启新片段
      currentStart = itemStart
      currentEnd = itemEnd
    }
  }

  // 把最后一段推入结果
  if (currentStart) {
    segments.push(formatSegment(currentStart, currentEnd))
  }

  return segments
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.video-container {
  background: #000;
  aspect-ratio: 16/9;
  width: 100%;
}

.bottom-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #f9fafb;
}

/* 日历 */
.calendarContainer {
  width: 60px;
  padding: 8px;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
}

.monthDropdown {
  position: relative;
  margin-bottom: 8px;
}

.selected {
  padding: 6px 0;
  text-align: center;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

.dropdownList {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 99;
  max-height: 300px;
  overflow-y: auto;
}

.dropdownItem {
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
}

.dropdownItem:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.dateList {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.dateItem {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.dateItem.active {
  background: #056df4;
  color: #fff;
  border-color: #056df4;
  font-weight: bold;
}

/* 时间轴容器：灰色 = 无数据区域 */
.timeline-wrapper {
  flex: 1;
  height: 100%;
  position: relative;
}

.scroll-container {
  width: 160px;
  height: 100%;
  overflow-y: auto;
  background: #e5e7eb; /* 无数据灰色 */
  border-left: 1px solid #d1d5db;
  position: relative;
}

.timeline-content {
  position: relative;
  width: 100%;
}

/* 录像片段：最高层级，蓝色 */
.segments-container {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3; /* 比刻度和背景高 */
}

.segment {
  position: absolute;
  right: 0;
  width: 8px;
  background: #27ae60;
  opacity: 0.7;
}

/* 中心线 */
.center-line {
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #9ca3af;
  z-index: 2;
}

/* 刻度 */
.ticks-container {
  position: absolute;
  left: 35px;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.tick {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
}

.tick-line {
  background: #9ca3af;
}

.tick-line.minor {
  width: 8px;
  height: 1px;
}

.tick-line.major {
  width: 16px;
  height: 1px;
  background: #6b7280;
  display: flex;
  align-items: center;
}

.tick-label {
  position: absolute;
  left: 22px;
  font-size: 12px;
  color: #4b5563;
  white-space: nowrap;
}

/* 拖拽 marker */
.marker {
  position: absolute;
  left: 10px;
  width: 120px;
  display: flex;
  align-items: center;
  z-index: 10;
  cursor: grabbing;
}

.marker-line {
  flex: 1;
  height: 2px;
  background: #056df4;
  box-shadow: 0 0 4px rgba(5, 109, 244, 0.4);
}

.marker-bubble {
  position: absolute;
  left: -4px;
  background: #056df4;
  color: #fff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(5, 109, 244, 0.3);
}
</style>
