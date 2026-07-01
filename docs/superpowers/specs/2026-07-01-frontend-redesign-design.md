# 智学伴行前端重设计 — 角色专属Dashboard

**日期：** 2026-07-01  
**类型：** 前端UI重设计  
**技术栈：** Vue 3 + TypeScript + Element Plus + ECharts

---

## 1. 设计目标

将当前通用后台风格升级为"角色专属Dashboard"模式，三种角色（学生/教师/管理员）共享统一设计语言，通过主题色区分。核心目标：

- **学生端：** 以AI个性化推荐为差异化核心，打造"学习教练"而非"工具列表"体验
- **教师端：** 以班级数据看板驱动教学决策，快速定位干预点
- **管理员端：** 全局系统监控，高效管理

---

## 2. 角色主题色

| 角色 | 主色 | 辅色 | 强调色 |
|------|------|------|--------|
| 学生 | `#4FACFE` | `#00E5FF` | `#FF6D00` |
| 教师 | `#7C4DFF` | `#B388FF` | `#FF4081` |
| 管理员 | `#546E7A` | `#90A4AE` | `#FFAB00` |

主题切换通过 `document.documentElement.dataset.role` + CSS变量实现。

---

## 3. 页面设计

### 3.1 学生端 Dashboard

**布局：自上而下单列**

1. **AI学习状态卡（顶部Banner）**
   - 个性化问候 + 日期
   - AI生成的今日学习建议（一段文字，说明当前薄弱点和建议）
   - 视觉：渐变背景，角色主色

2. **今日推荐作业卡片 + 知识掌握雷达图（左右双栏）**
   - 左侧：AI个性化生成的练习列表，含题目数量、预计时间、[开始练习]按钮
   - 右侧：ECharts雷达图，标注薄弱知识点（递归45%、动态规划38%）

3. **个性化学习路径时间线**
   - 水平步骤条，展示从当前到目标知识点的进阶路径
   - 当前阶段高亮，已掌握标记✅，未开始标记⬜
   - 底部AI解释文案

4. **智能答疑快捷入口 + 待完成作业列表（底部双栏）**
   - 左侧：问答输入框，轻量化的对话入口
   - 右侧：待完成作业列表，含截止时间

### 3.2 教师端 Dashboard

**布局：自上而下单列**

1. **统计卡片行（4列）**
   - 学生总数、平均成绩、待批作业数、本月活跃度趋势

2. **班级知识点掌握热力图（主区域）**
   - ECharts热力图：X轴学生、Y轴知识点、颜色深浅表掌握度
   - 自动标注全班薄弱知识点，给出教学建议

3. **高频错题Top5 + 作业提交动态（底部双栏）**

4. **快捷操作栏**
   - 发布新作业、上传课程资料、查看学情报告、进入答疑

### 3.3 管理员端 Dashboard

**布局：自上而下单列**

1. **系统状态卡片行（4列）**
   - 系统运行状态、今日API调用量、在线用户数、存储使用率

2. **用户增长趋势图 + API调用分布饼图（中部双栏）**

3. **操作日志列表 + 用户管理快捷入口（底部双栏）**

---

## 4. 设计系统

### 4.1 通用规则

- **卡片：** 白色背景 `#fff`，`border-radius: 8px`，`box-shadow: 0 2px 12px rgba(0,0,0,0.06)`，hover时上浮2px阴影加深
- **间距：** 24px标准栅格
- **字体：** PingFang SC / Microsoft YaHei，标题 20px/600 和 16px/600，正文 14px/400
- **数字：** 等宽数字 `font-feature-settings: "tnum"`
- **动效：** `transition: all 0.3s ease`

### 4.2 技术实现

- Element Plus组件保留，通过 `el-` 前缀样式覆盖 + CSS变量统一升级
- ECharts统一封装 `themeColors` 注入角色色系
- 不修改路由结构，新增 Dashboard 视图替换当前默认首页

---

## 5. 文件变更范围

| 操作 | 文件 |
|------|------|
| 新增 | `src/views/dashboard/StudentDashboard.vue` |
| 新增 | `src/views/dashboard/TeacherDashboard.vue` |
| 新增 | `src/views/dashboard/AdminDashboard.vue` |
| 新增 | `src/components/dashboard/WelcomeBanner.vue` |
| 新增 | `src/components/dashboard/RecommendCard.vue` |
| 新增 | `src/components/dashboard/KnowledgeRadar.vue` |
| 新增 | `src/components/dashboard/LearningPath.vue` |
| 新增 | `src/components/dashboard/StatsRow.vue` |
| 新增 | `src/components/dashboard/HeatmapChart.vue` |
| 新增 | `src/components/dashboard/WrongQuestions.vue` |
| 新增 | `src/components/dashboard/QuickActions.vue` |
| 新增 | `src/styles/dashboard.css` |
| 修改 | `src/router/index.ts` — 添加dashboard路由 |
| 修改 | `src/layout/MainLayout.vue` — 主题色变量注入 |

---

## 6. 路由设计

```
/dashboard/student   → StudentDashboard  (学生默认首页)
/dashboard/teacher   → TeacherDashboard  (教师默认首页)
/dashboard/admin     → AdminDashboard    (管理员默认首页)
```

根路径 `/` 根据角色自动重定向到对应Dashboard。现有 `/chat`、`/assignments`、`/analysis` 等模块页面保持不变。
