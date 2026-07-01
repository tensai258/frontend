<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
import type { StatItem } from '@/components/dashboard/StatsRow.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

const router = useRouter()

use([LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const stats: StatItem[] = [
  { title: '系统状态', value: '正常', icon: 'Monitor', color: '#00C853' },
  { title: '今日API调用', value: '12,456', icon: 'Connection', color: '#4FACFE' },
  { title: '在线用户', value: '89人', icon: 'User', color: '#7C4DFF' },
  { title: '存储使用', value: '67%', icon: 'Folder', color: '#FF6D00' }
]

const trendOption = ref({
  title: { text: '用户增长趋势', textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' }, left: 'left' },
  grid: { left: 40, right: 20, top: 50, bottom: 30 },
  xAxis: { type: 'category', data: ['6/25', '6/26', '6/27', '6/28', '6/29', '6/30', '7/1'] },
  yAxis: { type: 'value' },
  series: [{
    data: [320, 328, 335, 342, 345, 350, 356],
    type: 'line',
    smooth: true,
    lineStyle: { color: '#4FACFE', width: 3 },
    itemStyle: { color: '#4FACFE' },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#4FACFE40' }, { offset: 1, color: '#4FACFE05' }] } }
  }]
})

const pieOption = ref({
  title: { text: 'API调用分布', textStyle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e' }, left: 'left' },
  tooltip: { formatter: '{b}: {c}次 ({d}%)' },
  series: [{
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['50%', '55%'],
    data: [
      { value: 4230, name: '智能答疑' },
      { value: 3120, name: '作业系统' },
      { value: 2450, name: '学情分析' },
      { value: 1890, name: '知识库' },
      { value: 766, name: '系统管理' }
    ],
    label: { fontSize: 12 },
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }
  }]
})

const logItems = [
  { content: '管理员添加了新课程"算法设计与分析"', time: '5分钟前' },
  { content: '用户张三修改了登录密码', time: '28分钟前' },
  { content: '系统自动备份完成', time: '1小时前' },
  { content: '教师王教授上传了课程资料', time: '2小时前' },
  { content: '系统检测到异常登录尝试已拦截', time: '3小时前' }
]

const actions = [
  { label: '用户管理', icon: 'User', route: '/admin' },
  { label: '系统配置', icon: 'Setting', route: '/admin' },
  { label: '知识库管理', icon: 'Folder', route: '/admin' },
  { label: '查看日志', icon: 'Document', route: '/admin' }
]
</script>

<template>
  <div class="dashboard-page">
    <WelcomeBanner suggestion="系统运行32天，各项指标正常。存储空间预计15天后需扩容。" />

    <StatsRow :items="stats" />

    <div class="dashboard-grid-2">
      <div class="dashboard-card">
        <VChart :option="trendOption" style="height: 280px;" autoresize />
      </div>
      <div class="dashboard-card">
        <VChart :option="pieOption" style="height: 280px;" autoresize />
      </div>
    </div>

    <div class="dashboard-grid-2">
      <div class="dashboard-card">
        <div class="card-title">最近操作日志</div>
        <div class="log-list">
          <div v-for="(item, i) in logItems" :key="i" class="log-item">
            <el-icon color="#67C23A" v-if="i === 2"><CircleCheck /></el-icon>
            <el-icon color="#F56C6C" v-else-if="i === 4"><WarningFilled /></el-icon>
            <el-icon color="var(--dashboard-primary)" v-else><InfoFilled /></el-icon>
            <span class="log-text">{{ item.content }}</span>
            <span class="log-time">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-title">用户概览</div>
        <div class="user-overview">
          <div class="user-stat">
            <span class="user-stat-num">356</span>
            <span class="user-stat-label">总用户</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">312</span>
            <span class="user-stat-label">学生</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">38</span>
            <span class="user-stat-label">教师</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-num">6</span>
            <span class="user-stat-label">管理员</span>
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <el-button size="small" @click="router.push('/admin')">用户管理</el-button>
          <el-button size="small" @click="router.push('/admin')">角色配置</el-button>
        </div>
      </div>
    </div>

    <QuickActions :actions="actions" />
  </div>
</template>

<style scoped>
.log-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.log-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.user-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing);
  text-align: center;
}

.user-stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--dashboard-primary);
  font-feature-settings: "tnum";
}

.user-stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
