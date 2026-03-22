---
title: 如何快速创建领域Agent — OneAgent + MCPs 范式
description: 从单一LLM调用到多智能体系统的演进，提出OneAgent + MCPs范式：基于强大基础Agent结合领域MCP，替代为每个场景搭建烟囱式多智能体系统的传统方式。
author: xiaohui
date: 2026-03-21
tags: [methodology, ai-thinking]
original_url: https://xiaohui.cool/program/llm/如何快速创建领域Agent---OneAgent-+-MCPs-范式
---

## Agent 发展简史

### 单一 LLM 调用

最初的应用阶段，LLM 被视为文本处理的万能接口，用于完成摘要、分类、翻译等单一任务。交互简单明了，易于集成，成本和延迟可控。

### Workflow LLM 编排

随着需求复杂化，工作流模式应运而生，通过编排多个预定义的 LLM 或工具调用按步骤执行。例如：意图识别 → 资料收集 → 分析 → 汇总 → 报告产出。本质上是将标准作业流程（SOP）借助 LLM 自动化，但执行路径固定，难以覆盖长尾场景。

### 多智能体系统

发展到多智能体（Multi-Agent）系统，将简单的 LLM 调用扩展为 Agent 调用。Lilian Weng 定义的三要素："Planning（规划）+ Action（工具）+ Memory（记忆）"。

Anthropic 的 Barry Zhang 提出更简洁的概念："在循环中使用工具的模型"。代码层面的抽象为：

```python
env = Environment()
tools = Tools(env)
system_prompt = "Goals, constraints, and how to act"
user_prompt = get_user_prompt()

while True:
    action = llm.run(system_prompt + user_prompt + env.state)
    env.state = tools.run(action)
```

这是 ReAct 框架的变体，强调事前思考、行动观察，通过工具对现实世界产生影响。但该框架在模型能力不强时易出现死循环。

### One Agent + MCPs

从泄露的 Manus 源码来看，Loop 框架的典型代表就是 Manus。核心流程：分析事件 → 选择工具 → 等待执行 → 迭代 → 提交结果 → 待命。

**关键洞察**：若将 Manus 的 29 个函数替换为企业内部领域的 MCP Server，就能构建企业内部的 Manus。不仅可以完成 PPT 生成、全网搜索等工作，还能实现风控策略部署、保险精算、营销方案规划等具体业务需求。

**OneAgent + MCPs 范式** 的核心理念：基于强大的基础Agent，结合领域知识类 MCP 和规划器，在各个闭环领域内落地 Agent 智能。

## 技术细节

### Loop 框架与 to-do 质量

to-do 清单的质量直接决定 Agent 表现的上限。高质量 to-do 应像说明书般清晰，包含：

- 目标明确：产品目标、核心功能、用户场景
- 数据先行：定义数据结构、接口字段、数据库表
- 功能详述：用清晰语言描述功能点，消除歧义
- 上下文充足：提供代码文件路径、依赖库、设计图链接等线索
- 结构清晰：使用 Markdown 便于机器解析

### 如何封装 MCP Server

FunctionCall 的 Tool 是原子能力，MCP Server 是多个原子能力的服务包装（SaaS 化）。应该"从软件即服务（SaaS）向服务即软件（Service-as-Software）转变"。

### OneAgent + MCPs 模式下的 System Prompt

OneAgent 自带 MCP 集合，维护 mcprules 告诉模型运行时有兜底逻辑：咨询 MCP 顾问。当模型判断没有合适 MCP 时，通过 MCP 顾问找到合适 MCP 继续循环。

关键指导包括：开始时思考用户意图和可用 MCP Server，生成详细 todo.md，逐步执行并更新进度，严格区分领域术语避免 MCP Server 交叉使用。

## 当前缺陷与发展方向

### 当前缺陷

**1. to-do 质量的强依赖性** — Agent 表现高度依赖 to-do 清单质量，需要经验丰富的人工介入，限制了 Agent 的自主性和扩展性。

**2. MCP 管理与交互的挑战** — 错误传递与累积：单个 MCP 失败会向后传递。上下文传递困境：信息过少无法理解意图，过多则干扰处理。MCP 发现与选择局限。

**3. 状态管理与鲁棒性** — 需维护全局任务状态、各 MCP 调用状态和中间结果。死循环或无效循环风险。缺乏故障时的优雅中断和恢复机制。

**4. 知识整合与运用的深度** — KnowledgeMCP 的知识覆盖度、时效性，以及如何高效检索和运用知识是持续挑战。

### 发展方向

**构建标准化的 MCP/Agent 交互生态**：推动 API 格式、能力描述、输入输出规范的标准化。实现同步和异步任务的标准化分发。

**提升系统的鲁棒性和可观测性**：精细化错误处理与容错，任务状态持久化存储，从检查点恢复。

**优化 MCP 调用与管理**：对可并行的调用采用异步模式，研究高效的上下文压缩和选择性传递技术。

**系统智能提升**：通过强化学习优化 MCP 选择和任务序列规划，使 Agent 从历史经验中学习。KnowledgeMCP 不仅是静态库，Agent 可将新知识反馈给它。

## Agent 系统智能提升

OpenAI 的 DeepResearch 代表了"Model as Agent"理念，经过端到端强化学习，能在推理中链式调用外部工具。

强化学习让模型自己学会如何使用 MCP，区别于 Loop 框架中指示模型按规划逐步使用 MCP。RL 可让 MCP 调用变为模型推理链的一部分。

## 我与 Agent 做同事

虽未实现通用业务需求的打工 Agent，但已在深度使用 AI Coding。大量胶水代码、CRUD 代码交给 AI 完成，人负责维护输出的"氛围"。希望后期每个业务场景都能借助 OneAgent + MCPs 实现 AI Coding。
