# Community Sync Scripts

从 aichat 聊天数据自动生成社区成员画像。

## Pipeline

```
step1_stats.py  → 统计（纯Python，无LLM）
step2_evidence.py → 证据提取（纯Python / 可选LLM）
step3_generate.py → 生成md（调LLM）
```

## 用法

```bash
# Step 1: 统计影响力排名
python scripts/step1_stats.py ~/aichat/chats/27587714869_AI_Coding --top 20

# Step 2: 提取每人的代表性引用（TODO）
# Step 3: 生成 authors/*.md（TODO）
```

## 优化路线

| 层 | 方法 | 准确率 | 成本 |
|---|---|---|---|
| L1（当前） | 成员名单精确匹配 | ~90% | 零 |
| L2（下一步） | regex区分引用/观点/提及，加权计分 | ~93% | 零 |
| L3（Phase 3） | LLM从每个summary提取结构化贡献 | ~97% | $5-10 |

## 字段说明

### 当前输出（user_stats.json）
- `mention_count`: summaries中被提到的次数
- `at_count`: 原始消息中被@的次数
- `topic_count`: 关联的不同主题数
- `influence`: core / active / contributor
- `influence_score`: 0-1综合分

### 预留字段（L2/L3填入）
- `weighted_mentions`: 加权提及（引用×3 + 观点×2 + 提及×1）
- `quote_count`: 被直接引用原话的次数
- `contributions`: LLM提取的每次贡献列表
- `top_contribution`: 最有代表性的一句话
- `role_distribution`: {initiator: N, responder: M, questioner: K}
- `originality_avg`: 平均原创度(0-1)
