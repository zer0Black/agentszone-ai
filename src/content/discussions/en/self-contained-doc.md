---
title: Self-Contained Docs
description: Specs written for Agents must be self-contained — no implicit knowledge, no "refer to existing implementation." The document IS the complete context.
order: 1
playbook_chapter: 02b-machine-readable-spec
related_articles:
  - ai-native-engineering-playbook
---

## What is a Self-Contained Document?

When we hand tasks to an AI Agent, the Agent has no "team memory" — it doesn't know what was discussed in the last standup or the design intent behind a specific module. **Self-contained documentation** solves this: all necessary context, constraints, and acceptance criteria are packed into a single document so the Agent can work independently without asking follow-up questions.

Core principles:
- **No implicit knowledge** — don't write "refer to existing implementation"; spell out the interfaces and data structures
- **No conversational context** — the document must be understandable on its own
- **Internal segmentation** — each section has clear boundaries so the Agent can process it in parts

## Community Voices

> "我要求 /architect 输出的 design 一定要去 self contained 的，就是避免 /coder 分不清信息的层级乱引用其它文档。"
> — **马工 (Ma Gong)**，2026-02-18

> "human loop 结束了，自包含文档准备好了，然后就是全自动。"
> — **Violet**，2026-03-20

> "自包含还是咱们群里因为我们个别人提到的概念。"
> — **胥克谦 (Xu Keqian)**，2026-03-19

> "所以才有胥老师的，文档自包含，文档内自分段——这两点是让 Agent 真正能用起来的关键。"
> — **leo**，2026-03-20

## Why It Matters

Traditional requirements documents assume the reader is human — humans can ask follow-up questions, search Slack history, or check with colleagues. Agents can't. If a document isn't self-contained, the Agent either guesses (causing errors) or stops to ask you (breaking the automation flow).

Self-contained documentation is the infrastructure of AI-native engineering: **document quality directly determines Agent output quality**.
