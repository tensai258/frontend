<script setup lang="ts">
import { useRouter } from 'vue-router'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
import type { StatItem } from '@/components/dashboard/StatsRow.vue'
import HeatmapChart from '@/components/dashboard/HeatmapChart.vue'
import WrongQuestions from '@/components/dashboard/WrongQuestions.vue'
import type { WrongQuestion } from '@/components/dashboard/WrongQuestions.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

const router = useRouter()

const stats: StatItem[] = [
  { title: '学生总数', value: 128, icon: 'User', color: '#7C4DFF', trend: 3, trendText: '较上月' },
  { title: '平均成绩', value: '78.5', icon: 'TrendCharts', color: '#00C853', trend: 2.1, trendText: '较上月' },
  { title: '待批作业', value: '23份', icon: 'Document', color: '#FF6D00' },
  { title: '本月活跃度', value: '92%', icon: 'DataLine', color: '#4FACFE', trend: 12, trendText: '较上月' }
]

const heatmapX = ['学生A', '学生B', '学生C', '学生D', '学生E', '学生F', '学生G', '学生H', '学生I', '学生J']
const heatmapY = ['递归', '动态规划', '指针', '数组', '链表', '排序', '图论', '贪心']
const heatmapData: [number, number, number][] = []

for (let i = 0; i < heatmapY.length; i++) {
  for (let j = 0; j < heatmapX.length; j++) {
    heatmapData.push([j, i, Math.round(Math.random() * 60 + 30)])
  }
}

const wrongQuestions: WrongQuestion[] = [
  { id: 1, title: '递归遍历二叉树', errorRate: 78 },
  { id: 2, title: '动态规划状态方程设计', errorRate: 72 },
  { id: 3, title: '链表反转', errorRate: 65 },
  { id: 4, title: '排序算法复杂度分析', errorRate: 58 },
  { id: 5, title: '贪心策略证明', errorRate: 52 }
]

const heatmapTip = '"动态规划"全班薄弱，建议课堂教学重点强化'

const actions = [
  { label: '发布新作业', icon: 'Plus', route: '/assignments' },
  { label: '上传课程资料', icon: 'Upload', route: '/admin' },
  { label: '查看学情报告', icon: 'DataAnalysis', route: '/analysis/class' },
  { label: '进入答疑', icon: 'ChatDotRound', route: '/chat' }
]
</script>

<template>
  <div class="dashboard-page">
    <WelcomeBanner suggestion="本学期数据结构课程整体表现良好，动态规划模块需重点加强。" />

    <StatsRow :items="stats" />

    <HeatmapChart
      title="班级知识点掌握热力图"
      :x-axis="heatmapX"
      :y-axis="heatmapY"
      :data="heatmapData"
      :tip="heatmapTip"
    />

    <div class="dashboard-grid-2">
      <WrongQuestions :items="wrongQuestions" title="高频错题 Top5" />

      <div class="dashboard-card">
        <div class="card-title">最近作业提交动态</div>
        <div class="activity-list">
          <div v-for="item in [
            { user: '张三', action: '提交了', target: '数据结构作业3', time: '2分钟前' },
            { user: '李四', action: '提交了', target: '算法设计作业2', time: '15分钟前' },
            { user: '王五', action: '逾期提交', target: '数据结构作业2', time: '1小时前' },
            { user: '赵六', action: '提交了', target: '数据结构作业3', time: '2小时前' },
            { user: '钱七', action: '提交了', target: '算法设计作业2', time: '3小时前' }
          ]" :key="item.user + item.target" class="activity-item">
            <el-avatar :size="28" style="font-size: 12px;">{{ item.user.charAt(0) }}</el-avatar>
            <span class="activity-text">
              <strong>{{ item.user }}</strong> {{ item.action }} {{ item.target }}
            </span>
            <span class="activity-time">{{ item.time }}</span>
          </div>
        </div>
        <el-button type="primary" link style="margin-top: 12px;" @click="router.push('/assignments')">
          查看全部提交 →
        </el-button>
      </div>
    </div>

    <QuickActions :actions="actions" />
  </div>
</template>

<style scoped>
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
