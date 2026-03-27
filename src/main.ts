import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Input, Swiper, SwiperItem, Toast, Skeleton } from '@nutui/nutui'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(Input)
app.use(Swiper)
app.use(SwiperItem)
app.use(Toast)
app.use(Skeleton)
app.use(createPinia())
app.use(router)

app.mount('#app')
