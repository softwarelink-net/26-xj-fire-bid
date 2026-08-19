<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchTender } from '@/composables/useApi'

const tender = ref<Record<string, unknown> | null>(null)
let timer: number | null = null
const countdown = computed(() => (tender.value?.countdown || {}) as Record<string, number | boolean>)
const tech = computed(() => (Array.isArray(tender.value?.tech_points) ? tender.value?.tech_points : []) as string[])
const innov = computed(() => (Array.isArray(tender.value?.innovation) ? tender.value?.innovation : []) as string[])
const ca = computed(() => (Array.isArray(tender.value?.ca_guide) ? tender.value?.ca_guide : []) as string[])

const fallback = {
  title: '新疆医科大学第一附属医院智慧消防系统等5项采购项目公开招标公告',
  issuer: '新疆医科大学第一附属医院',
  project_no: 'XZJ266-100（3）-ZK',
  publish_time: '2026-08-13 19:01',
  keywords:
    '新疆医科大学第一附属医院, 智慧消防系统, 视频监控系统, 门禁一卡通, 弱电智能化, XZJ266-100（3）-ZK, 医院安防采购, 新疆政府采购',
  summary:
    '新疆医科大学第一附属医院公开招标智慧消防系统等5项采购项目，预算金额922,215.12元，包含视频监控系统、入侵报警及紧急求助系统、门禁及一卡通系统、电子巡更系统、智慧消防系统各1套。投标人须具备电子与智能化工程专业承包二级及以上资质且具备安全生产许可证，通过政采云平台线上投标，投标文件递交截止时间为2026年9月4日16:00。',
  budget: 922215.12,
  deadline: '2026-09-04 16:00:00',
  tech_points: [
    '五大异构弱电子系统全域融合：深度集成视频监控、入侵报警/紧急求助、门禁一卡通、电子巡更、智慧消防 5 套系统。',
    '跨系统秒级应急协同与联动编排：支持火灾与求助信号触发多路视频自动切换、门禁紧急疏散释放与广播联动。',
    '电子巡更与隐患闭环流转：实现巡更点位 RFID/蓝牙精准核验与通道堵塞、设备损坏等隐患工单全流程追溯。',
    '信创国密脱敏与极简 Serverless 架构：敏感人员信息国密 SM4 动态脱敏，基于 Cloudflare Workers + D1 高性能承载。',
  ],
  innovation: [
    '医院三维空间与安防消防态势感知雷达：立体呈现门诊楼、住院楼与医技楼等重点部位设备运行与隐患分布。',
    '智能医护紧急求助一键处置链条：融合求助弹窗、就近安保定位与视频跟踪，实现 1 分钟快速到达现场响应。',
  ],
  ca_guide: [
    '登录新疆政府采购网 / 政采云平台完成供应商注册、实名认证与电子签章绑定。',
    '申领符合国密 SM2 标准的 CA 数字证书（USB Key），安装驱动与电子签章控件。',
    '使用 CA 对投标文件加密签章后，于 2026 年 9 月 4 日 16:00 前完成网上递交。',
    '投标人须具备电子与智能化工程专业承包二级及以上资质，并具备安全生产许可证。',
    '保留签章回执与文件哈希校验码，作为电子档案不可篡改存证。',
  ],
}

async function load() {
  try {
    const res = await fetchTender()
    tender.value = res.data
  } catch {
    tender.value = { ...fallback }
  }
}

function tick() {
  const deadline = String(tender.value?.deadline || fallback.deadline)
  const end = new Date(deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  if (tender.value) {
    tender.value.countdown = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    }
  }
}

onMounted(async () => {
  await load()
  tick()
  timer = window.setInterval(tick, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="space-y-5">
    <div class="panel flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p class="text-xs text-rose-300">公开招标 · 免密查阅</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-100">{{ tender?.title || fallback.title }}</h2>
      </div>
      <div class="flex gap-2 text-center">
        <div v-for="k in ['days', 'hours', 'minutes', 'seconds']" :key="k" class="rounded bg-fire-950 px-3 py-2">
          <p class="font-mono text-xl text-rose-300">{{ countdown[k] ?? '--' }}</p>
          <p class="text-[10px] text-slate-500">{{ { days: '天', hours: '时', minutes: '分', seconds: '秒' }[k] }}</p>
        </div>
      </div>
    </div>

    <section class="panel p-5 space-y-3 text-sm text-slate-300">
      <h3 class="text-base font-semibold text-slate-100">1. 标题</h3>
      <p>{{ tender?.title || fallback.title }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">2. 项目发包方</h3>
      <p>{{ tender?.issuer || fallback.issuer }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">3. 项目编号</h3>
      <p class="font-mono text-rose-200">{{ tender?.project_no || fallback.project_no }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">4. 项目发布时间</h3>
      <p>{{ tender?.publish_time || fallback.publish_time }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">5. 关键词</h3>
      <p>{{ tender?.keywords || fallback.keywords }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">6. 摘要</h3>
      <p class="leading-7">{{ tender?.summary || fallback.summary }}</p>
      <p class="text-rose-200">预算金额：¥ {{ Number(tender?.budget || fallback.budget).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</p>
      <h3 class="pt-2 text-base font-semibold text-slate-100">7. 技术要点</h3>
      <ul class="list-disc space-y-2 pl-5">
        <li v-for="(t, i) in (tech.length ? tech : fallback.tech_points)" :key="i">{{ t }}</li>
      </ul>
      <h3 class="pt-2 text-base font-semibold text-slate-100">8. 技术创新性</h3>
      <ul class="list-disc space-y-2 pl-5">
        <li v-for="(t, i) in (innov.length ? innov : fallback.innovation)" :key="i">{{ t }}</li>
      </ul>
    </section>

    <section class="panel p-5">
      <h3 class="text-base font-semibold text-slate-100">政采云平台线上投标及 CA 证书绑定指引</h3>
      <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
        <li v-for="(t, i) in (ca.length ? ca : fallback.ca_guide)" :key="i">{{ t }}</li>
      </ol>
      <a
        class="btn-gold mt-4 inline-flex"
        href="https://www.zcygov.cn/"
        target="_blank"
        rel="noopener noreferrer"
      >
        前往政采云平台
      </a>
    </section>
  </div>
</template>
