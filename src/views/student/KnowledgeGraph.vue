<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { questionApi } from '@/api/modules/question'
import { analysisApi } from '@/api/modules/analysis'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { TreeChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([TreeChart, TooltipComponent, TitleComponent, CanvasRenderer])

const router = useRouter()
const loading = ref(false)
const categories = ref<string[]>([])
const categoryStats = ref<Record<string, { total: number; correct: number; wrong: number }>>({})
const wrongQuestionStats = ref<Record<string, number>>({})
const selectedNode = ref<any>(null)

const masteryColors: Record<string, string> = {
  '优秀': '#10B981',
  '良好': '#3B82F6',
  '中等': '#F59E0B',
  '薄弱': '#EF4444',
  '未学习': '#9CA3AF'
}

const masteryIcons: Record<string, string> = {
  '优秀': '🎯',
  '良好': '📚',
  '中等': '📝',
  '薄弱': '⚠️',
  '未学习': '📖'
}

const getMasteryLevel = (correctRate: number): string => {
  if (correctRate >= 90) return '优秀'
  if (correctRate >= 70) return '良好'
  if (correctRate >= 60) return '中等'
  if (correctRate > 0) return '薄弱'
  return '未学习'
}

const treeData = computed(() => {
  const children = categories.value.map(cat => {
    const stats = categoryStats.value[cat] || { total: 0, correct: 0, wrong: 0 }
    const correctRate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    const level = getMasteryLevel(correctRate)
    const wrongCount = wrongQuestionStats.value[cat] || 0
    const hasWrong = wrongCount > 0
    
    return {
      name: cat,
      value: stats.total,
      itemStyle: {
        color: hasWrong ? '#EF4444' : masteryColors[level],
        borderColor: '#fff',
        borderWidth: 3,
        shadowBlur: hasWrong ? 12 : 8,
        shadowColor: hasWrong ? 'rgba(239, 68, 68, 0.5)' : `${masteryColors[level]}40`
      },
      label: {
        color: '#303133',
        fontSize: 12,
        fontWeight: 500
      },
      stats,
      correctRate,
      level,
      category: cat,
      hasWrong,
      wrongCount
    }
  })

  return {
    name: '数据结构',
    itemStyle: {
      color: '#6366F1',
      borderColor: '#fff',
      borderWidth: 4,
      shadowBlur: 12,
      shadowColor: 'rgba(99, 102, 241, 0.4)'
    },
    label: {
      fontSize: 14,
      fontWeight: 700,
      color: '#4F46E5'
    },
    children: [
      {
        name: '线性结构',
        itemStyle: { color: '#8B5CF6', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => ['线性表', '顺序表', '链表', '栈', '队列', '串'].includes(c.name))
      },
      {
        name: '数组与广义表',
        itemStyle: { color: '#EC4899', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => c.name === '数组和广义表')
      },
      {
        name: '树形结构',
        itemStyle: { color: '#14B8A6', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => ['树与二叉树', '二叉树', '线索二叉树', '哈夫曼树'].includes(c.name))
      },
      {
        name: '图',
        itemStyle: { color: '#F97316', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => ['图', '图的存储与遍历', '最小生成树', '最短路径', '拓扑排序与关键路径'].includes(c.name))
      },
      {
        name: '查找',
        itemStyle: { color: '#06B6D4', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => ['查找', '哈希查找'].includes(c.name))
      },
      {
        name: '排序',
        itemStyle: { color: '#84CC16', borderColor: '#fff', borderWidth: 2 },
        children: children.filter(c => c.name === '排序算法')
      }
    ]
  }
})

const graphOption = computed(() => {
  return {
    title: {
      text: '知识图谱',
      subtext: '数据结构知识点掌握情况',
      left: 'center',
      top: 10,
      textStyle: { 
        fontSize: 20, 
        fontWeight: 700, 
        color: '#1E293B',
        textShadowBlur: 4,
        textShadowColor: 'rgba(0,0,0,0.1)'
      },
      subtextStyle: { fontSize: 13, color: '#64748B' }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#1E293B', fontSize: 13 },
      formatter: (params: any) => {
        if (params.data?.stats) {
          const stats = params.data.stats
          const rate = params.data.correctRate?.toFixed(1) || '0'
          const level = params.data.level || '未学习'
          const icon = masteryIcons[level]
          const wrongCount = params.data.wrongCount || 0
          return `
            <div style="min-width: 160px">
              <div style="font-weight:700;font-size:15px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
                <span>${icon}</span> ${params.name}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
                <div style="background:#F8FAFC;padding:8px;border-radius:8px;text-align:center">
                  <div style="font-size:18px;font-weight:700;color:#3B82F6">${stats.total}</div>
                  <div style="font-size:11px;color:#64748B">总题数</div>
                </div>
                <div style="background:#F0FDF4;padding:8px;border-radius:8px;text-align:center">
                  <div style="font-size:18px;font-weight:700;color:#10B981">${stats.correct}</div>
                  <div style="font-size:11px;color:#64748B">已掌握</div>
                </div>
              </div>
              <div style="background:#FEF2F2;padding:8px;border-radius:8px;text-align:center;margin-bottom:10px">
                <div style="font-size:18px;font-weight:700;color:#EF4444">${stats.wrong}</div>
                <div style="font-size:11px;color:#64748B">待加强</div>
              </div>
              ${wrongCount > 0 ? `
              <div style="background:#FEE2E2;padding:8px;border-radius:8px;text-align:center;margin-bottom:10px">
                <div style="font-size:18px;font-weight:700;color:#DC2626">${wrongCount}</div>
                <div style="font-size:11px;color:#DC2626">错题数量</div>
              </div>
              ` : ''}
              <div style="margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:12px;color:#64748B">正确率</span>
                  <span style="font-size:12px;font-weight:600;color:${masteryColors[level]}">${rate}%</span>
                </div>
                <div style="height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${rate}%;background:${masteryColors[level]};border-radius:3px;transition:width 0.3s"></div>
                </div>
              </div>
              <div style="text-align:center;padding:6px 12px;background:${params.data.hasWrong ? '#EF444415' : masteryColors[level] + '15'};border-radius:6px;color:${params.data.hasWrong ? '#EF4444' : masteryColors[level]};font-weight:600;font-size:13px">
                ${params.data.hasWrong ? '有错题' : level}
              </div>
            </div>
          `
        }
        return `<strong style="font-size:14px">${params.name}</strong>`
      }
    },
    series: [{
      type: 'tree',
      data: [treeData.value],
      layout: 'orthogonal',
      orient: 'LR',
      symbol: 'roundRect',
      symbolSize: [90, 36],
      initialTreeDepth: 3,
      animationDurationUpdate: 750,
      roam: false,
      label: {
        position: 'inside',
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 12,
        color: '#fff',
        fontWeight: 500
      },
      leaves: {
        label: {
          position: 'inside',
          verticalAlign: 'middle',
          align: 'center',
          fontSize: 11,
          color: '#fff'
        }
      },
      lineStyle: {
        color: '#CBD5E1',
        width: 2,
        curveness: 0.5
      },
      emphasis: {
        focus: 'descendant',
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(59, 130, 246, 0.5)',
          borderWidth: 4
        },
        label: {
          fontSize: 14,
          fontWeight: 700
        }
      },
      expandAndCollapse: true
    }]
  }
})

const handleChartClick = (params: any) => {
  if (params.data?.stats) {
    selectedNode.value = params.data
  }
}

const closePopup = () => {
  selectedNode.value = null
}

const goToPractice = (category: string) => {
  router.push({ path: '/student/questions', query: { category } })
}

const goToWrongQuestions = (category: string) => {
  router.push({ path: '/student/wrong-questions', query: { category } })
}

const goToDetails = (category: string) => {
  router.push({ path: '/student/analysis', query: { category } })
}

const fetchData = async () => {
  loading.value = true
  try {
    const [catRes, listRes, wrongRes] = await Promise.all([
      questionApi.getCategories(),
      questionApi.getList({ page: 1, size: 500 }),
      analysisApi.getWrongQuestions({ page: 1, size: 1000 })
    ])
    categories.value = catRes || []
    
    const stats: Record<string, { total: number; correct: number; wrong: number }> = {}
    const questions = listRes.list || []
    
    for (const q of questions) {
      const cat = q.tags || '未分类'
      if (!stats[cat]) {
        stats[cat] = { total: 0, correct: 0, wrong: 0 }
      }
      stats[cat].total++
    }
    
    const wrongStats: Record<string, number> = {}
    const wrongList = wrongRes.list || []
    for (const wq of wrongList) {
      const cat = wq.tags || wq.knowledgeName || '未分类'
      if (!wrongStats[cat]) {
        wrongStats[cat] = 0
      }
      wrongStats[cat]++
    }
    
    categoryStats.value = stats
    wrongQuestionStats.value = wrongStats
  } catch {
    ElMessage.error('加载知识图谱数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  document.addEventListener('click', closePopup)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closePopup)
})
</script>

<template>
  <div class="kg-page">
    <div class="kg-container">
      <div class="kg-header">
        <div class="header-left">
          <h2>知识图谱</h2>
          <p class="subtitle">点击节点查看详细信息</p>
        </div>
        <div class="legend-row">
          <span v-for="(color, label) in masteryColors" :key="label" class="legend-item">
            <span class="legend-dot" :style="{ background: color }"></span>
            {{ label }}
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background: #EF4444"></span>
            有错题
          </span>
        </div>
      </div>
      
      <div v-loading="loading" class="kg-chart-wrapper" @click.stop>
        <VChart
          v-if="categories.length > 0"
          :option="graphOption"
          style="height: 750px; width: 100%"
          autoresize
          @click="handleChartClick"
        />
        <el-empty v-else-if="!loading" description="暂无知识图谱数据" />
      </div>

      <!-- 节点详情弹窗 -->
      <transition name="popup">
        <div v-if="selectedNode" class="node-popup" @click.stop>
          <div class="popup-card">
            <button class="close-btn" @click="closePopup">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            
            <div class="popup-header" :style="{ background: `linear-gradient(135deg, ${selectedNode.hasWrong ? '#EF4444' : masteryColors[selectedNode.level]}20, ${selectedNode.hasWrong ? '#EF4444' : masteryColors[selectedNode.level]}05)` }">
              <div class="node-icon" :style="{ background: selectedNode.hasWrong ? '#EF4444' : masteryColors[selectedNode.level] }">
                {{ selectedNode.hasWrong ? '❌' : masteryIcons[selectedNode.level] }}
              </div>
              <div class="header-info">
                <h3>{{ selectedNode.name }}</h3>
                <span class="level-badge" :style="{ background: selectedNode.hasWrong ? '#EF4444' : masteryColors[selectedNode.level], color: '#fff' }">
                  {{ selectedNode.hasWrong ? '有错题' : selectedNode.level }}
                </span>
              </div>
            </div>
            
            <div class="popup-stats">
              <div class="stat-card">
                <div class="stat-number" style="color: #3B82F6">{{ selectedNode.stats?.total || 0 }}</div>
                <div class="stat-text">题目总数</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #10B981">{{ selectedNode.stats?.correct || 0 }}</div>
                <div class="stat-text">已掌握</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" style="color: #EF4444">{{ selectedNode.wrongCount || 0 }}</div>
                <div class="stat-text">错题数量</div>
              </div>
            </div>
            
            <div class="progress-section">
              <div class="progress-header">
                <span>正确率</span>
                <span class="progress-value" :style="{ color: masteryColors[selectedNode.level] }">
                  {{ selectedNode.correctRate?.toFixed(1) || '0' }}%
                </span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: `${selectedNode.correctRate || 0}%`,
                    background: `linear-gradient(90deg, ${masteryColors[selectedNode.level]}, ${masteryColors[selectedNode.level]}CC)`
                  }"
                ></div>
              </div>
            </div>
            
            <div class="popup-actions">
              <button class="action-btn primary" :style="{ background: masteryColors[selectedNode.level] }" @click="goToPractice(selectedNode.name)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                去练习
              </button>
              <button class="action-btn secondary" @click="goToWrongQuestions(selectedNode.name)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12l8-8M12 12L4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                查看错题
              </button>
              <button class="action-btn tertiary" @click="goToDetails(selectedNode.name)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                详情分析
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.kg-page {
  height: 100%;
}

.kg-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1E293B;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 13px;
  color: #94A3B8;
  margin: 4px 0 0 0;
}

.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748B;
  font-weight: 500;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kg-chart-wrapper {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 20px;
  position: relative;
}

/* 弹窗样式 */
.node-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  padding: 20px;
}

.popup-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  animation: popupIn 0.3s ease;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #1E293B;
  transform: rotate(90deg);
}

.popup-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.node-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1E293B;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.popup-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 24px;
}

.stat-card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-text {
  font-size: 12px;
  color: #64748B;
}

.progress-section {
  padding: 20px 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748B;
}

.progress-value {
  font-weight: 700;
  font-size: 15px;
}

.progress-bar {
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.popup-actions {
  display: flex;
  gap: 10px;
  padding: 0 24px 24px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn.primary {
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.action-btn.secondary {
  background: #FEE2E2;
  color: #DC2626;
}

.action-btn.secondary:hover {
  background: #FECACA;
}

.action-btn.tertiary {
  background: #E0F2FE;
  color: #0284C7;
}

.action-btn.tertiary:hover {
  background: #BAE6FD;
}

/* 弹窗动画 */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}
</style>
