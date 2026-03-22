---
title: 如何放心100% AI交付需求 — Loop 与 Agent Loop
description: 基于Claude Code生态的Loop和Agent Loop插件，实现AI 7×24小时持续开发。介绍Ralph-Loop自迭代和Supervisor代理循环，将端到端测试转化为应用级强化学习的反馈信号。
author: xiaohui
date: 2026-03-21
tags: [ai-coding, quality-control]
original_url: https://xiaohui.cool/program/full-stream/如何放心-100-percent-AI-交付需求(2)----Loop-与-Agent-Loop
---

## 介绍

上文介绍了端到端测试的概念与运用，留下了一个问题：**如何让 AI 能够持续自动优化这些测试？** 本文介绍 Claude Code 生态的两个插件来解决这个问题。

## 我推荐的 CC 用法

### CC 本身是一个 Unix 工具

CC 可以跑在服务器上做运维，可以把 Claude 放在管道中：

```bash
cat code.py | claude -p '分析此代码中的错误' --output-format json > analysis.json
```

可以在脚本里面写循环来调用 CC 批处理多个任务。

### CC 应该被并发使用

使用 git worktree 并发提 PR：

```bash
git worktree add -b feature/auth ../project-auth feature/current_branch
git worktree add -b feature/ui-redesign ../project-ui feature/current_branch
```

甚至可以多配一台电脑，或者自己多开几个 Docker/虚拟机并行开发。

### CC 的上下文工程

1. PreToolUse Hook：在工具执行前做点事
2. PostToolUse Hook：在工具执行后做点事
3. **Stop Hook**：在 CC 即将停止 Loop 时做点事——后面两个插件的核心

## 两个 Loop 插件

### Ralph-Loop

Claude Code 本身是 Loop 组成的智能体。人类使用过程中，提需求-规划-实现-review-再提需求…本身也是一个 Loop。借助 Stop Hook，可以强制 CC 每次在其自然停下的时候反思任务是否已经完成，如果没完成就继续 Loop：

```bash
/ralph-loop "Fix xxx" --max-iterations 10 --completion-promise "FIXED"
```

这个命令表示让模型修复 xxx，一直到 CC 认为自己修复完成显式输出 "FIXED" 才会停止，最大迭代 10 次。

Ralph Loop 通过一个简单的 Bash 脚本，在每一轮任务结束后彻底关闭当前 AI 进程并重新启动，将进度和状态存储在本地文件中，剥离"短期记忆"。

然而实际中成功率没有那么高。模型会反思进入自身的"无进度循环"中，也可能触发上下文爆掉，需要保持任务原子化和可验证。

### 再套一个 Agent Loop？

Ralph-Loop 的缺点很明显——单纯让 CC 自己反思，并不能给 CC 指导性的意见。解决办法就是在最外面的 Loop 里面再加一个 Agent — **Supervisor**，将真正扮演人类自己的角色。它会 Fork 完整的会话上下文，评估实际的工作质量，而不是简单检测关键词或信号。

Supervisor 等于你来推进项目：Agent 是否在等待确认？是否做了应该做的事？代码质量是否达标？需求是否全部满足？

| 方面 | Ralph | Supervisor |
|------|-------|-----------|
| 检测方式 | AI 输出结构化状态 + 规则解析 | Supervisor AI 直接审查 |
| 评估方式 | 基于信号和规则 | Fork 会话上下文评估实际质量 |
| 灵活性 | 需要更新规则代码 | 更新 Prompt 即可 |

复杂场景下，AI 归根结底不能代替人做判断。Supervisor 在简单场景下可以真正代替人，在复杂场景下依然需要人是主角。

## 基于测试的应用级别"强化学习"

传统软件开发中，测试是**验证**。但在 AI Coding 时代，测试演变成了**反馈信号源**。当 AI 可以自己运行端到端测试，同时处于 Loop 中，开发就构成了一个典型的强化学习过程：

```
需求（指标目标）
  ↓
AI 大量生成实现方案
  ↓
E2E 测试运行（Reward Signal）
  ↓
分析 badcase（State observation）
  ↓
调整策略、重新实现
  ↓
[循环]
```

- **传统**：人工分析问题 → 人工写代码 → 测试验证（人是中心）
- **AI 时代**：目标明确 → AI 自动探索方案空间 → E2E 测试反馈 → AI 快速调整（测试是中心）

使用 ralph-loop 持续自迭代，某个指标从 0 → 86%，没有人类手工参与。

## 总结

基于 Loop 和 Agent Loop，终于有能力让 AI 做到 7×24 小时开发并交付需求。关键在于将端到端测试从验证工具转化为强化学习的反馈信号，让 AI 在持续循环中自主提升交付质量。
