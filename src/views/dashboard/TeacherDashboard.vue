<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analysisApi } from '@/api/modules/analysis'
import { assignmentApi } from '@/api/modules/assignment'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import StatsRow from '@/components/dashboard/StatsRow.vue'
import type { StatItem } from '@/components/dashboard/StatsRow.vue'
import HeatmapChart from '@/components/dashboard/HeatmapChart.vue'
import WrongQuestions from '@/components/dashboard/WrongQuestions.vue'
import type { WrongQuestion } from '@/components/dashboard/WrongQuestions.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const stats = ref<StatItem[]>([
  { title: '学生总数', value: '-', icon: 'User', color: '#7C4DFF' },
  { title: '平均成绩', value: '-', icon: 'TrendCharts', color: '#00C853' },
  { title: '待批作业', value: '-', icon: 'Document', color: '#FF6D00' },
  { title: '本月活跃度', value: '-', icon: 'DataLine', color: '#4FACFE' }
])

const heatmapX = ref<string[]>([])
const heatmapY = ref<string[]>([])
const heatmapData = ref<[number, number, number][]>([])
const heatmapTip = ref('')

const wrongQuestions = ref<WrongQuestion[]>([])
const suggestion = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const [classRes, masteryRes, assignmentRes] = await Promise.allSettled([
      analysisApi.getClassAnalysis(1),
      analysisApi.getKnowledgeMastery(0, undefined),
      assignmentApi.getAssignments({ page: 1, size: 10 })
    ])

    if (classRes.status === 'fulfilled' && classRes.value) {
      const data: any = classRes.value
      stats.value[0].value = data.scoreDistribution?.reduce((a: number, b: any) => a + b.count, 0) || '-'
      stats.value[1].value = data.avgScore?.toFixed(1) || '-'
      suggestion.value = data.subjectComparison?.map((s: any) => `${s.subject}:${s.avg}`).join('，') || ''
    }

    if (masteryRes.status === 'fulfilled' && masteryRes.value) {
      const data: any = masteryRes.value
      const students = ['学生A', '学生B', '学生C']
      const knowledges = data.map((k: any) => k.knowledgeName).slice(0, 8)
      heatmapX.value = students
      heatmapY.value = knowledges.length ? knowledges : ['递归', '动态规划', '指针', '数组']
      const hd: [number, number, number][] = []
      for (let i = 0; i < heatmapY.value.length; i++) {
        for (let j = 0; j < heatmapX.value.length; j++) {
          hd.push([j, i, Math.round((data[i]?.masteryRate || Math.random() * 40 + 50))])
        }
      }
      heatmapData.value = hd
      wrongQuestions.value = data
        .filter((k: any) => k.wrongQuestions > 0)
        .map((k: any) => ({ id: k.knowledgeId, title: k.knowledgeName, errorRate: Math.round(100 - k.masteryRate) }))
        .slice(0, 5)
    }

    if (assignmentRes.status === 'fulfilled' && assignmentRes.value) {
      const data: any = assignmentRes.value
      stats.value[2].value = (data.list?.length || 0) + '份'
    }
  } catch {
    ElMessage.warning('加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

const actions = [
  { label: '发布新作业', icon: 'Plus', route: '/assignments' },
  { label: '上传课程资料', icon: 'Upload', route: '/admin' },
  { label: '查看学情报告', icon: 'DataAnalysis', route: '/analysis/class' },
  { label: '进入答疑', icon: 'ChatDotRound', route: '/chat' }
]

onMounted(fetchData)
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <WelcomeBanner :suggestion="suggestion || '欢迎使用智学伴行教学管理平台'" />

    <StatsRow :items="stats" />

    <HeatmapChart
      title="班级知识点掌握热力图"
      :x-axis="heatmapX"
      :y-axis="heatmapY"
      :data="heatmapData"
      :tip="heatmapTip || '加载知识点数据以查看热力图'"
    />

    <div class="dashboard-grid-2">
      <WrongQuestions :items="wrongQuestions" title="薄弱知识点 Top5" />

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
