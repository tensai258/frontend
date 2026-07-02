# 学生端六模块重设计

**日期：** 2026-07-02  
**类型：** 前端UI重设计  
**技术栈：** Vue 3 + TypeScript + Element Plus + ECharts

---

## 1. 设计目标

将学生端重构为六个独立模块：题库中心、作业中心、错题集、个性化推荐、学情分析、智能答疑。顶部Tab导航切换，模块间通过错题集串联数据流。

---

## 2. 整体架构

**导航方式：** 顶部Tab切换栏，6个Tab等宽分布

```
📚题库中心 | 📝作业中心 | ❌错题集 | 🎯个性化推荐 | 📊学情分析 | 💬智能答疑
```

**数据流：**

```
 题库中心 ──→ 错题集 ←── 作业中心
(自主练习)    (汇聚)     (教师作业)
                │
                ▼
          个性化推荐
          (基于错题推荐)
```

**路由设计：**

```
/student/questions     → 题库中心
/student/assignments   → 作业中心
/student/wrong-qs      → 错题集
/student/recommend     → 个性化推荐
/student/analysis      → 学情分析
/student/chat          → 智能答疑
```

---

## 3. 模块详情

### 3.1 题库中心

- 知识点标签横向滚动筛选（全部/递归/动态规划/指针/链表/排序...）
- 题目集卡片网格：名称、难度星级、已做题数、正确率
- 进入答题模式：单题展示、即时判对错
- 答错自动汇入错题集

### 3.2 作业中心

- Tab切换状态筛选：进行中/已完成/已逾期
- 作业卡片列表：标题、教师、题目数、截止日期、进度条
- 复用现有AssignmentDetail答题详情

### 3.3 错题集

- 独立模块，汇聚题库+作业所有错题
- 来源筛选Tab：全部/来自题库/来自作业
- 错题卡片：知识点、错误次数、来源、错误原因、难度
- 三色状态：🔴未重做 🟡待巩固 ✅已掌握
- 重做正确后自动移除/降级

### 3.4 个性化推荐

- 基于错题集数据驱动
- 按薄弱程度排序展示知识点（星级 + 错题数 + 建议 + 去练习按钮）
- 错题集为空时展示空状态引导：
  > "当前没有错题，请先去题库中心或完成作业再来"
  > [去题库中心] [去作业中心]

### 3.5 学情分析

- 学习报告式排版，去AI化
- 总体表现卡片：评级(B+)、正确率、答题数、学习天数
- 知识点星级评价（⭐1-5 + 文字等级）
- 近期趋势：纯文字+简单箭头趋势描述
- 无热力图、无雷达图、无渐变动效

### 3.6 智能答疑

- ChatGPT/DeepSeek风格沉浸式聊天
- 左侧会话列表（可折叠），右侧对话区
- Markdown渲染 + 代码高亮
- SSE流式输出
- 知识来源引用标注

---

## 4. 设计系统

**去AI化原则（适用于学情分析等模块）：**
- 等级制替代百分比：⭐1-5 + 优秀/良好/一般/薄弱/需加强
- 文字优先于图表，静态优先于动效
- 白色背景、清晰分区线、无渐变无发光
- 报告风格字体：标题可考虑衬线体

**保留AI感的模块：**
- 智能答疑：允许现代化的聊天气泡、流式动画、深色代码块
- 个性化推荐：允许适度的卡片高亮和引导动效

---

## 5. 文件变更范围

| 操作 | 文件 |
|------|------|
| 新增 | `src/views/student/StudentLayout.vue` — Tab容器页 |
| 新增 | `src/views/student/QuestionBank.vue` — 题库中心 |
| 新增 | `src/views/student/WrongQuestions.vue` — 错题集 |
| 新增 | `src/views/student/Recommend.vue` — 个性化推荐 |
| 新增 | `src/components/student/WrongQuestionCard.vue` |
| 新增 | `src/components/student/QuestionSetCard.vue` |
| 新增 | `src/components/student/ReportSection.vue` |
| 新增 | `src/components/student/EmptyWrongState.vue` |
| 重设计 | `src/views/chat/ChatView.vue` — ChatGPT风格 |
| 修改 | `src/views/assignment/AssignmentView.vue` — 视觉升级 |
| 修改 | `src/views/analysis/StudentAnalysis.vue` — 报告风格 |
| 修改 | `src/router/index.ts` — 学生端路由重构 |
| 删除 | `src/views/dashboard/StudentDashboard.vue` — 不再需要 |

---

## 6. 路由变更

学生端路由统一挂在 `/student` 路径下：

```
/student → StudentLayout (Tab容器，默认显示题库中心)
  /student/questions    → QuestionBank
  /student/assignments  → AssignmentView
  /student/wrong-qs     → WrongQuestions
  /student/recommend    → Recommend
  /student/analysis     → StudentAnalysis
  /student/chat         → ChatView
```

根路径 `/` 学生角色重定向至 `/student`。
