---
title: "End-to-End Evolution for Unknown Failures: CloudMate's Adaptive Path Exploration"
description: CloudMate handles tens of thousands of failure analysis requests per week. This article dissects its evaluate-mutate-backtest loop — how to build a self-evolving Agent system that adapts to unknown failures in a constantly changing production environment.
author: fuquanzhi
date: 2026-02-14
tags: [aiops, cloudmate, agent, operations]
---

Last month, we were fortunate to invite Lin Zhaoxiang, head of Tencent Cloud's CloudMate intelligent ops system, for an online sharing session. The session centered on a core proposition: in a constantly changing production environment, how do you build an Agent system that can adapt to unknown failures?

As large model capabilities improve, integrating AI into development and production environments is inevitable. However, ops scenarios are highly dynamic: system architectures are iterating, code logic is changing, and microservice topologies are dynamically adjusting. No matter how powerful a static Agent is at deployment time, as time passes, the divergence between its preset knowledge base and the actual environment will inevitably cause capability degradation.

Facing this challenge, current engineering practice is divided into two schools:

**The "bottom-up" knowledge engineering school** tries to address change through fine-grained knowledge management. Engineers design complex knowledge graphs and synchronize documentation and rules with each release. However, this approach faces a fundamental scaling problem: as system components increase, the complexity of knowledge maintenance grows linearly or even exponentially (O(n)). Document format heterogeneity, content conflicts, and retrieval accuracy all become bottlenecks limiting Agent performance.

**The "top-down" end-to-end evolution school** draws inspiration from GPT-series models' "intelligence emerging from massive data" approach: rather than relying on manually preset rules, it lets the system learn directly through interaction with the environment. Just as rule-based NLP methods were replaced by end-to-end training, CloudMate chose this path — not pre-specifying "how to do it," but letting the system explore optimal solutions through continuous attempts based on outcome feedback.

Lin pointed out that to achieve this kind of end-to-end self-evolution, the system must build a complete loop: **evaluation defines direction, mutation generates paths, backtesting ensures safety.** All three are indispensable. CloudMate has deployed hundreds of Agent instances handling tens of thousands of failure analysis requests per week. In this article, we dissect the implementation of these three modules in CloudMate through the sharing session content.

## Evaluation: Defining the Boundaries of Capability

Evaluating Agent performance in an open ops environment is far more complex than evaluating traditional NLP tasks. Anthropic's 2025 research identified three major challenges in Agent evaluation: output non-determinism, task definition ambiguity, and execution environment side effects. If evaluation isn't accurate, evolution goes off course.

CloudMate built a **dual-track evaluation system** combining objective metrics and subjective reasoning, aimed at identifying successful trajectories from exploration and internalizing them.

### Objective Metrics: Quantifying Efficiency and Results

This is the foundational layer, focusing on execution statistics:

- **Task completion rate**: Did it produce a clear conclusion within the allotted time?
- **Tool call efficiency**: Were there redundant calls, invalid parameters, or infinite loops?
- **End-to-end latency**: Time consumed from alert trigger to root cause identification.

### Subjective Logic: Evidence-Chain Reasoning Review

This is the core innovation in CloudMate's evaluation system. In ops diagnostics, a correct conclusion doesn't mean a correct process (e.g., the Agent might have "guessed" the root cause). Therefore, CloudMate introduces a high-capability large model as a "judge" to audit the Agent's reasoning process.

Core review dimensions include:

- **Evidence completeness**: Is every inference the Agent makes backed by explicit observational data?
- **Logical coherence**: Are there causal breaks between reasoning steps?
- **Intent understanding**: Did the Agent correctly understand the user's ambiguous instructions?

Through this dual-track scoring, the system can precisely identify "low-scoring cases." These cases aren't just records of failure — they're "seeds" for system evolution, directly triggering the next phase's mutation process.

## Mutation: Building Effective Exploration Trajectories

When the evaluation module locks onto a "needs fixing" failure case, CloudMate initiates the mutation process. Since Agent exploration runs are time-consuming and expensive, random exploration is both costly and ineffective. In CloudMate, "mutation" isn't fully random — it's directional search in an unknown solution space for optimal strategies. CloudMate employs two complementary path generation strategies: parallel exploration and expert guidance.

### Parallel Exploration: Trading Compute for Intelligence

For most failures with definable state, CloudMate uses large-scale parallel sampling. The system launches N Agent instances concurrently in a sandbox environment, forcibly expanding the search space by raising the model's temperature or using different backend models.

Taking a "database connection pool exhaustion" scenario as an example, a single traditional Agent might get stuck in the local optimum of "check configuration → recommend scaling." In parallel exploration mode, the system generates multiple divergent paths:

- **Path A**: Focus on resource configuration, suggest increasing `max_connections`. (Evaluation: failure — treats symptoms, not causes)
- **Path B**: Focus on full-chain tracing, discover specific API calls have extremely high latency. (Evaluation: inconclusive)
- **Path C**: Focus on database internal state, query `slow_query_log`, discover a SQL query missing an index is causing connection pile-up. (Evaluation: success — root cause identified)

This approach of obtaining high-quality trajectories through large-scale sampling echoes practices in other existing systems, like DeepSeekMath-V2 (2025)'s reasoning strategy at test time. Stable evaluation capability combined with high-quality exploration trajectories can significantly break through the model's own reasoning ceiling and capture troubleshooting paths that are normally difficult to generate correctly.

### Expert Guidance: Behavioral Cloning and Reverse Reasoning

For some complex failures that are difficult to handle, pure random exploration is extremely inefficient. Here, CloudMate introduces a human-machine collaboration mechanism. When a human expert intervenes to handle a case, the system records their complete operation sequence in the background — which monitoring panels were viewed, which grep commands were executed. These high-confidence trajectories are the best learning samples for the Agent.

The system feeds the expert's operation records as prompts to the Agent, asking it to generate: "Why did the expert choose to query the slow log at this step?" Through this reverse reasoning, the Agent can make humans' tacit intuition explicit, converting it into executable logic chains.

### Knowledge Convergence: Differential Analysis and Rule Extraction

A successful path alone is just one example — it must be generalized into universal knowledge. The system introduces a Critic model to compare the differences between "the original failed path" and "the new successful path," distilling key differences (such as "must check slow log") into structured knowledge rules, waiting to be merged into the main library.

At this point, an unknown failure case has been transformed into a new knowledge patch. However, this newly generated rule, while effective for the current case, may have unknown side effects on other scenarios. To prevent new knowledge from causing old capability degradation, this rule must pass sandbox backtesting before being merged.

## Backtesting: Automated Validation of Knowledge Increments

Newly mutated knowledge before merging into the main library is essentially a local optimum — only effective for the current failure. To ensure this knowledge has generalization ability and doesn't break the system's existing capability structure, it must go through a complete regression testing process.

The backtesting module's core function is quality gatekeeping: preventing an Agent from solving new problem A while causing old problem B's handling capability to degrade, thereby ensuring each iteration of the knowledge base is positive.

### Full Regression and Capability Anti-Degradation

CloudMate has built an automated pipeline similar to software engineering's continuous integration. The core component is the baseline case library, storing many historically solved typical failure cases. Each time the mutation module submits a "knowledge update request," the system automatically triggers a full regression:

1. **Load new knowledge**: The Agent instance loads the knowledge base containing the new rules
2. **Baseline testing**: The Agent must re-run all historical cases in the baseline library
3. **Judgment logic**: The system compares pass rates between old and new versions — if new rules cause any historical case's success rate to drop, the update is immediately rejected

This mechanism ensures capabilities continuously accumulate without regression, freeing ops system evolution from dependence on manual review.

### Engineering Challenge: Environment Decoupling and Snapshot Simulation

Implementing the above regression testing in ops faces challenges more severe than code testing: data timeliness and environmental dynamism. Last year's failure case depended on the logs, metrics, and network topology of that time. The live environment changes in real-time; directly re-running historical cases causes the Agent to query the current monitoring system, leading to data inconsistencies and large numbers of false alarms.

To solve this, CloudMate built a snapshot-based sandbox simulation architecture:

- **Data snapshots**: When baseline cases are recorded, the system not only captures the Agent's conversation logic but also captures all tool calls' original return data
- **Sandbox isolation**: During backtesting, the Agent is isolated in a closed sandbox environment; all queries are intercepted by the system
- **Mock replay**: The system doesn't access live monitoring — it reads the JSON data from that time in the snapshot and returns it to the Agent

Through this approach, the system successfully decouples test execution from the time dimension. The Agent can reason within a "frozen historical slice," ensuring the baseline test's repeatability and objectivity.

## Building a Deterministic Evolution Loop

At this point, CloudMate has built a complete self-evolving entity. The evaluate, mutate, and backtest modules form an end-to-end engineering loop:

- **Evaluation** provides acceptance criteria, screening standards for mutation-generated candidate solutions, ensuring stable input for knowledge generation
- **Mutation** provides candidate solutions, using parallel exploration or expert path analysis for directional search in the solution space, continuously exploring the updated answer space
- **Backtesting** provides boundary constraints, conducting rigorous logical validation of candidate knowledge through full regression in the sandbox environment, ensuring new rules meet the system's global consistency constraints

## Engineering Limits of E2E Mode

Despite CloudMate's theoretically self-evolving loop, the system still faces multi-dimensional challenges in real deployment.

### Exploration Mechanism Dependency Bias: Experts Over Machines

Although the system designed a large-scale parallel exploration module, in current production practice, knowledge internalization still heavily depends on expert guidance. The effectiveness of parallel exploration is limited by the single source of randomness (mainly relying on the model's intrinsic temperature parameters or prompt perturbations). For long-chain, deep-logic failures, pure machine exploration is often unable to converge to optimal solutions within limited compute. Currently, parallel exploration serves more as an auxiliary means, while high-quality trajectory generation still requires human-machine collaboration.

### Cold Start and Baseline Construction Cost

System safety depends on backtesting, and backtesting effectiveness depends on a high-quality baseline case library. Lin acknowledged in the sharing that maintaining the case library is the "highest-cost" component. To ensure backtesting accuracy, every baseline case requires expert cleaning, labeling, and confirmation. During the system's cold-start phase, this means enormous labor investment.

### "Snapshot" Limitations of the Simulation Environment

The current sandbox backtesting mechanism is primarily based on single-system static snapshots. However, failures in modern microservice architectures often involve multi-component interaction (like distributed transaction consistency, cross-service cascade failures). For failures with complex external dependencies, building a high-fidelity isolated sandbox is extremely challenging.

### Long-Term Knowledge Base Convergence

Although the self-evolving architecture aims to solve the O(n) complexity problem of manual knowledge maintenance, automation doesn't mean zero entropy increase. As automatically generated rules accumulate, the knowledge base may develop logical conflicts, rule redundancy, or overfitting. Whether the system can maintain knowledge base consistency under long-term automated execution remains an open question requiring long-term observation.

## Conclusion: E2E and the Boundaries of Engineering Governance

CloudMate's practice reveals a long-overlooked perspective: an AI Agent's core competitiveness lies not only in static capability limits at deployment time, but also in its rate of evolution after deployment. Software systems are continuously iterating; an Agent that cannot co-evolve with the system it manages is unsustainable in production.

CloudMate attempts to solve this fundamental contradiction end-to-end by building a complete "evaluate (detect deviation) — mutate (explore new knowledge) — backtest (converge boundaries)" loop, giving Agents the ability to co-evolve with software systems.

However, we must clearly recognize that this end-to-end self-evolution mechanism is no "silver bullet" for ops. The end-to-end approach attempts to automatically solve the O(n) complexity problem of manually maintaining knowledge bases, but it doesn't eliminate complexity itself — it transfers it to new dimensions: how to build high-fidelity simulation environments, how to design low-cost evaluation functions, and how to converge automatically generated knowledge entropy.

For static, strongly-ruled, low-tolerance scenarios (like accounting systems, core network configuration), traditional deterministic code governance remains an irreplaceable foundation. For dynamic, ambiguous, high-dimensional scenarios (like microservice failure localization, performance tuning), self-evolving Agents offer a way to break through bottlenecks.

The future ops system may not be purely human-designed or purely Agent-autonomous, but some kind of gray-scale fusion of both. In this process, exploring the upper bound of end-to-end capabilities and the baseline of engineering governance will be a long-term challenge the entire industry must face together.

*This article is adapted from a Tencent Cloud CloudMate intelligent ops system technical sharing session.*
