---
title: "How AIOps Systems Should Evolve with Software: Lessons from CloudMate"
description: "Knowledge-based AIOps systems face a fundamental challenge — software keeps iterating and knowledge expires. CloudMate made a systematic exploration on two fronts: how to keep a knowledge base current with fast-moving code, and how to ensure software evolution doesn't break AI ops effectiveness."
author: fuquanzhi
date: 2026-01-03
tags: [aiops, cloudmate, knowledge-base, operations]
---

In the previous article, we reviewed the current frontier of AIOps. From the perspective of diagnostic performance, Context Engineering has become the core methodology of AI ops. Its core idea is elegant and direct: by collecting system state, historical experience, and expert knowledge in a structured way, large language models can understand problems and provide solutions the way an experienced engineer would. Current system state plus a stable historical knowledge base can greatly unleash the potential of large language models.

The relationship between intelligent ops and knowledge bases is extremely close. RCACopilot's success, for example, depends on the vast root cause analysis database that Microsoft's email service has accumulated over the years — without that database, performance would drop by a factor of dozens, becoming nearly unusable. Yet almost all disclosed knowledge-based systems have ignored a fundamental software engineering problem: software iteration itself. In fast-moving software systems, documentation expires, knowledge expires, and this creates enormous challenges for all knowledge-based intelligent ops systems.

The challenge comes from two dimensions: on one hand, how do we keep the knowledge base current with rapidly evolving code? On the other hand, how does software system evolution avoid breaking the effectiveness of intelligent ops?

Tencent Cloud's CloudMate ops system is the first to make a systematic exploration on both dimensions.

This article is based on CloudMate's presentation at GOPS Shanghai 2025. Due to limited technical details disclosed, this article focuses on high-level design and the insights it brings. We look forward to the team sharing more implementation details in the future.

## The Dilemma of Self-Evolving Knowledge Bases

"Knowledge bases need automatic updates" is not a new idea.

Long before AI ops emerged, many teams recognized the limitations of manually maintaining knowledge bases. Teams kept proposing "self-evolving knowledge systems," trying to keep documentation current with software evolution. After LLMs burst onto the scene, the rise of RAG brought another wave of "dynamic knowledge base updates." Many talked about doing it; successful deployments were few. The root cause is that knowledge validation itself is full of complexity — quantifying the quality of knowledge base updates is difficult, and ultimately large amounts of disordered updates cause the knowledge base to spiral out of control.

Consider a typical scenario: a system undergoes a service split, breaking the original monolithic monitoring API `/metrics/query` into `/metrics/service/query` and `/metrics/infrastructure/query`. Engineers update the API documentation per procedure, writing the new calling conventions into the knowledge base.

The impact of this simple update on the knowledge base is hard to estimate:

- A "CPU anomaly troubleshooting guide" that references the old API will now get 404 errors
- A "slow service response diagnostic process" that assumes unified monitoring data now needs to query two separate endpoints
- Example code in a "alert rule configuration guide" from a year ago is completely broken

With each new document added, these potential conflict points grow at O(n) — each can produce semantic, interface, or assumption conflicts with any existing document. Verifying these conflicts requires understanding each document's context, dependencies, and implicit assumptions — far beyond the capacity of human maintenance.

This dilemma has another dimension. From the perspective of the software being maintained, the system's own operability is also difficult to assess. When software evolves continuously, how do you ensure each change doesn't introduce problems that break the Agent's ability to operate the system?

This is the most important differentiator between CloudMate and other existing products, and the core of this article's discussion: how to build stable and reliable AI ops capabilities in a dynamically evolving environment.

## CloudMate's Solution

CloudMate's core insight is: since we find it difficult to effectively validate the quality of the knowledge base itself, let's directly validate the end result. This approach simultaneously solves both dimensions of iteration stability — software system updates can't break the Agent's operability, and knowledge base updates can't reduce the Agent's problem-solving ability.

CloudMate adopts a two-tier architecture, separating online failure diagnosis from offline knowledge evolution:

**Upper tier: Online failure diagnosis system**

This is the traditional Agent loop with three core components:

- **Knowledge base**: Stores domain knowledge the Agent needs for task execution, including business topology, failure pattern libraries, expert diagnostic logic, and standardized troubleshooting processes
- **Agent loop**: The classic "plan-execute-observe" loop, where the Agent formulates investigation plans guided by the knowledge base, calls tools to execute, observes results, and iterates
- **Tool library**: Provides actual troubleshooting capabilities including log tools, metrics tools, DB tools, etc.

**Lower tier: Offline validation and evolution system**

This is CloudMate's core innovation. It's based on a simple principle: **the best validation environment is practice itself** — the most reliable way to test whether knowledge is effective comes from real use in actual tasks. The system implements this in a sandbox environment through three components:

The **sandbox environment** provides an isolated validation space, ensuring knowledge updates can't affect live services. The **case library** stores complete trajectories (plan-execute-observe) produced by Agents during historical task execution, including thought processes, tools called, and results returned. These trajectories serve two purposes: as baseline cases for knowledge evolution, and as regression tests for system operability.

The **exploration loop** is the key mechanism of the entire system. The CloudMate team sets up baseline cases for different scenarios, each with clearly verifiable completion conditions. The specific flow is: multiple Agents retry baseline cases in parallel in the sandbox → the scoring system summarizes new knowledge from successful or failed attempts → this knowledge is not committed directly, but triggers re-validation of baseline cases → only when similar or better performance is achieved is the update accepted. This ensures each iteration of the knowledge base is progress.

At the same time, historical trajectories in the case library are used for another dimension of assurance: when the managed software pushes changes, these trajectories are re-run using the latest system state to get tool call results. If results differ significantly from historical records, it indicates the change may have broken system operability, requiring further investigation — possibly updating documentation, or even adjusting the change itself.

The entire system forms dual protection: the exploration loop ensures knowledge base evolution doesn't degrade, and the case library ensures system evolution doesn't break operability.

## Understanding the Design Essence

Having described CloudMate's design, does this system actually work?

Unfortunately, the presentation didn't disclose specific performance data. But even without quantitative metrics, we can still see CloudMate's core problem-solving approach from the design itself.

Revisiting the two challenges posed at the start:

- How does the knowledge base keep up with code evolution? → CloudMate lets the knowledge base update automatically through the exploration loop, and uses baseline cases to verify that post-update capability doesn't decrease
- How does software evolution avoid breaking operability? → CloudMate uses historical execution trajectories as regression tests to promptly detect breaking changes

The exploration loop asks "given this knowledge, can the Agent solve the baseline task?" The case library asks "after the change, has the Agent's execution trajectory changed abnormally?" Both mechanisms focus on validating final outcomes.

## Implications and Practice

The traditional approach tries to validate the "correctness" of knowledge: is this document well-written? Does this diagnostic logic meet specifications? Are there gaps in this process? But "correctness" is subjective, hard to quantify, and context-dependent.

CloudMate shifts the angle: regardless of what's written in the knowledge base, focus only on whether the Agent can ultimately solve the problem. This shift represents a paradigm leap — from validating "inputs" (knowledge) to validating "outputs" (capability).

This thinking has proven effective in software engineering: we use tests, benchmarks, and load tests to validate system capability, not debate the "theoretical correctness" of code, algorithms, or architecture.

CloudMate applies the same engineering philosophy to AI systems: use baseline cases to define capability standards, automated testing to verify achievement, and regression testing to ensure no regression. This gives "knowledge quality" — a fuzzy concept — an actionable measurement: **the question shifts from "is this knowledge good?" to "did the Agent's capability improve after using this knowledge?" The former is unanswerable; the latter is testable.**

This is one of the "AI-Native" principles the industry keeps mentioning but never clearly articulates: ground AI system quality assurance in verifiable capability outputs, not hard-to-quantify knowledge inputs. CloudMate's design reflects exactly this principle.

## Unanswered Questions

CloudMate demonstrates one feasible path for AI system self-evolution, but since the presentation details were limited, some key mechanisms weren't disclosed. Let me discuss a few questions closely related to the core themes.

### The Evaluation Mechanism Paradox

CloudMate uses a combined evaluation system of "objective metrics + supervisor model scoring." Objective metrics (like execution time, tool call counts) are relatively reliable, but supervisor model scoring introduces a fundamental paradox.

CloudMate's core insight is "validate capability, not knowledge," because we find it difficult to assess the quality of knowledge itself. But in the exploration loop, the supervisor model is fundamentally still trying to evaluate whether a trajectory is good — judging whether the Agent's execution process, reasoning path, and tool selection are appropriate. This faces the same dilemma as evaluating "whether knowledge is good": if we truly knew what a good trajectory looks like, why would we need an LLM? We could just write rules.

Where do the supervisor model's standards come from? How does it avoid introducing new biases? How do these standards update as business scenarios evolve? The presentation didn't disclose how CloudMate resolves this paradox.

### Validation Boundaries

The sandbox is the foundation of validation, but not all failures can be safely replayed. Technically, intermittent failures caused by concurrency races, problems dependent on real user behavior, and complex distributed system interactions are all difficult to fully reproduce. These boundaries directly limit the completeness of validation.

### Automation Boundaries

Even with most processes automated, fully removing human involvement is likely neither realistic nor desirable. The key question is: how do you identify the tipping point that requires human intervention? How do you find balance between automation and controllability?

CloudMate demonstrates the possibility of AI system self-evolution, and also reveals fundamental challenges: the credibility of evaluation mechanisms, the boundaries of validation capability, and the balance between automation and controllability. We look forward to the CloudMate team sharing more technical details to help the industry understand the solutions to these challenges.
