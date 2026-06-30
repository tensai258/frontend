<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'

// 模拟数据
const stats = ref({
  totalUsers: 1286,
  totalStudents: 1024,
  totalTeachers: 128,
  totalAssignments: 356,
  totalChats: 15234,
  activeToday: 186
})

const recentUsers = ref([
  { id: 1, username: 'zhangsan', nickname: '张三', role: 'student', createdAt: '2024-01-15', status: 'active' },
  { id: 2, username: 'lisi', nickname: '李四', role: 'teacher', createdAt: '2024-01-14', status: 'active' },
  { id: 3, username: 'wangwu', nickname: '王五', role: 'student', createdAt: '2024-01-13', status: 'inactive' },
  { id: 4, username: 'zhaoliu', nickname: '赵六', role: 'student', createdAt: '2024-01-12', status: 'active' },
  { id: 5, username: 'qianqi', nickname: '钱七', role: 'teacher', createdAt: '2024-01-11', status: 'active' }
])

const recentAssignments = ref([
  { id: 1, title: '数学期中考试', subject: '数学', teacher: '李老师', deadline: '2024-02-01', status: 'active' },
  { id: 2, title: '英语作文练习', subject: '英语', teacher: '王老师', deadline: '2024-01-28', status: 'active' },
  { id: 3, title: '物理实验报告', subject: '物理', teacher: '张老师', deadline: '2024-01-25', status: 'closed' },
  { id: 4, title: '化学方程式测试', subject: '化学', teacher: '刘老师', deadline: '2024-01-30', status: 'active' },
  { id: 5, title: '语文阅读理解', subject: '语文', teacher: '陈老师', deadline: '2024-02-05', status: 'active' }
])

const roleMap: Record<string, string> = {
  student: '学生',
  teacher: '教师',
  admin: '管理员'
}

const roleTypeMap: Record<string, 'success' | 'warning' | 'danger'> = {
  student: 'success',
  teacher: 'warning',
  admin: 'danger'
}

const statusMap: Record<string, string> = {
  active: '正常',
  inactive: '停用',
  closed: '已关闭'
}

const statusTypeMap: Record<string, 'success' | 'info' | 'danger'> = {
  active: 'success',
  inactive: 'danger',
  closed: 'info'
}

onMounted(() => {
  // 加载数据
})
</script>

<template>
  <div class="admin-view">
    <PageHeader title="管理后台" description="系统数据概览与管理" />

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="总用户数" :value="stats.totalUsers" icon="UserFilled" color="#409EFF" />
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="学生数" :value="stats.totalStudents" icon="Reading" color="#67C23A" />
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="教师数" :value="stats.totalTeachers" icon="User" color="#E6A23C" />
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="作业总数" :value="stats.totalAssignments" icon="Document" color="#F56C6C" />
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="对话次数" :value="stats.totalChats" icon="ChatDotRound" color="#909399" />
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <StatCard title="今日活跃" :value="stats.activeToday" icon="Odometer" color="#409EFF" />
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row :gutter="16" class="tables-row">
      <el-col :xs="24" :lg="12">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近注册用户</span>
              <el-button type="primary" text size="small">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentUsers" style="width: 100%" size="small">
            <el-table-column prop="nickname" label="昵称" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="roleTypeMap[row.role]" size="small">{{ roleMap[row.role] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="statusTypeMap[row.status]" size="small">{{ statusMap[row.status] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="注册时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近布置作业</span>
              <el-button type="primary" text size="small">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAssignments" style="width: 100%" size="small">
            <el-table-column prop="title" label="作业标题" show-overflow-tooltip />
            <el-table-column prop="subject" label="科目" />
            <el-table-column prop="teacher" label="教师" />
            <el-table-column prop="deadline" label="截止时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="statusTypeMap[row.status]" size="small">{{ statusMap[row.status] }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="action-card" shadow="hover">
      <template #header>
        <span>快捷操作</span>
      </template>
      <div class="quick-actions">
        <el-button type="primary" :icon="'User'">用户管理</el-button>
        <el-button type="success" :icon="'Document'">作业管理</el-button>
        <el-button type="warning" :icon="'ChatDotRound'">对话记录</el-button>
        <el-button type="info" :icon="'Setting'">系统设置</el-button>
        <el-button type="danger" :icon="'Bell'">通知管理</el-button>
        <el-button type="primary" plain :icon="'Download'">数据导出</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.admin-view {
  padding-bottom: 40px;
}

.stats-row {
  margin-bottom: 20px;
}

.tables-row {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.action-card {
  border-radius: 12px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
