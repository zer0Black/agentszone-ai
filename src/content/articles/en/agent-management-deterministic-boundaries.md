---
title: "Agent Management: The Deterministic Boundaries of AI Coding"
description: AI Coding is not a technical problem — it's a management problem. From requirements to execution to acceptance, building explicit contracts at each stage is the deterministic boundary of AI Coding. A milestone summary from the Agent Management forum.
author: fuquanzhi
date: 2026-03-07
tags: [ai-coding, agent-management, methodology, software-engineering]
---

Over the past year, we've been in the trenches with hundreds of developers at the Agent Management forum — debugging, retrospecting, and iterating together. This article is our milestone summary.

## I. A Debate That's Finally Settled

"AI-written code is completely unusable."

People have been saying this since ChatGPT launched at the end of 2023, and they kept saying it through 2025. AI kept raising the bar on the scale of projects it could handle, but the criticism never stopped.

Until December 2025. Andrej Karpathy declared that AI programming would become the future of software engineering. Linus Torvalds started writing code with AI. Even the most stubborn old-school hackers began to surrender.

Meanwhile:

- Anthropic used Claude Code to write a C compiler from scratch that can compile the Linux kernel
- A fully AI-written scalable filesystem appeared at the FAST conference
- PingCAP's CTO Huang Dongxu and Taichi Graphics founder Hu Yuanming are deep AI Coding users who are even rolling it out team-wide for productivity gains

So the question arises: with the same AI, why can some people build production-grade systems and roll them out company-wide, while others can barely make a personal web project without bugs everywhere?

If you've asked this question, this article is for you. **In a word: AI Coding is not a technical problem — it's a management problem.**

## II. The Frustrated Technical Expert

Anthropic published a C language compiler fully developed using Claude Code that successfully compiled the Linux 6.9 kernel. After the announcement, beyond the hype cycle celebrations, most criticism came from the technical community: macros weren't being used, paths were hardcoded, no handling of x86 16-bit real mode startup code... and then the comments would end with mockery of AI: see, AI still can't do it, I'm still irreplaceable.

Ironically, the most technically elite people are the slowest to adopt AI Coding. The reason isn't AI — it's that their management thinking hasn't caught up.

### AI Is Your Colleague

Suppose you hired an employee with extremely high IQ, incredible learning ability, but today is their first day on the job. You tell them "write a compiler that can compile Linux" — just that one sentence. What happens?

I'm confident they would not produce a full-featured compiler compatible with every ecosystem. Can it compile Hello World? You didn't say. Dynamic linking? You didn't mention it. 16-bit real mode — implement from scratch or use existing tools? At acceptance time, you think they "botched it." But actually your management failed.

**AI will perform to the standard you define, then stop.** If your standard isn't clear, it will stop at a point that matches some commonsense understanding — which may or may not be your commonsense.

This is why technical experts resist AI Coding. They excel at translating requirements into perfect code. But the problem lies in the requirements themselves — making the requirements clear, defining the boundaries precisely, quantifying the acceptance criteria. The technical expert mocks the bug-riddled Claude Code compiler, not realizing that the good software they wrote was never really because of them — it was because of their product manager.

### An Old Problem, One Hundred Years Old

Economics has a classic problem studied for decades called the principal-agent problem. Coincidentally, the "Agent" in economics and the AI Agent we talk about today are the same word.

AI is now capable enough that we should treat it as an economic actor in the formal sense. When you delegate a task to an Agent, three challenges naturally arise:

- **Information asymmetry**: You don't fully know what it's doing
- **Goal misalignment**: Its understanding diverges from your intent
- **Verification difficulty**: It's hard to judge how well it's actually doing

Management theory's answer is to establish contracts and systems: clearly define objectives, set process checkpoints, define measurable acceptance criteria. Our answer is essentially the same. This is also why the forum is named "Agent Management."

## III. The Deterministic Boundaries

Just as a team lead doesn't have time to review every line of code and trusts their colleagues' abilities, good management is never about seeking perfect control at every step — it's about setting clear standards at key checkpoints and leaving space in between.

We call these key checkpoints "deterministic boundaries," and we split the entire AI Coding workflow into three segments, establishing explicit contracts in each.

### 3.1 Requirements: Documents Are the Product, AI Is the Compiler

In traditional development, code is the final deliverable. In the AI Coding era, **documents are.** AI plays a role closer to a compiler — it "compiles" your documents into runnable code. The output quality of a compiler depends on the quality of its input. This means documents must be solid.

Our practical path is: start from the PRD, generate architecture documentation, refine into detailed implementation documents, then have AI implement strictly according to those documents. Tools like Kiro and SpecKit can help you build the document system early, but they claim to be the final answer, which leads many people to try them and give up — feeling "it's nothing special."

What's the problem? Since documents have become the final product, documents themselves need acceptance testing. Generating a spec with one sentence has the same result as generating software with one sentence — you're handing the uncertainty to AI, and it will inevitably spiral out of control.

There are two difficulties here. First, AI generates documents dozens of times faster than humans can read — you simply can't keep up. Second, asking AI to review produces "structure is clear, recommend adding exception handling" — correct but useless, solving nothing.

The real problem isn't the review action itself — it's that most people who receive a spec don't know what they should be focusing on. Many technical people instinctively audit whether the architecture is sound, whether interface naming is consistent, whether the data model is elegant. AI does these aspects quite well — even too well. **But the only part we need to audit is user stories.**

A user story describes a real person using the software to accomplish a real task. "As a streamer, I need to be able to start a poll in my live room" — that's a user story. It doesn't care about your architecture design, API naming, or database choice. It cares about one thing: can this person accomplish what they want to do?

Conversely, if your document can walk through every user story end-to-end — every interface that needs to be called at each step is defined, parameters and return values are complete, exception cases are covered — then the document is complete. This is what we call "document testing": using user stories as test cases to walk through the document, as opposed to the subjective "document review." Having AI walk through each user story step by step produces deterministic results, independent of anyone's subjective judgment.

Architecture-level review is still needed — it just doesn't need to be done by humans. Having different models cross-validate from different angles works better than one person staring at it, and costs much less. Humans handle user stories; AI handles technical details — each stays in their lane.

### 3.2 Execution: The Attention Boundary

AI has a characteristic very similar to humans: limited attention. When the Context Window is packed with too much information, performance degrades significantly. Every task handed to AI must be controlled within what it can handle.

This has two dimensions:

**Spatially, it's modularity.** Give it complete input conditions: what does this module implement, what are the inputs, what are the return values? Define the API Contract clearly, bound the edges with test suites. AI can work freely within this clearly defined fence; it doesn't need to worry about anything outside.

**Temporally, it's step-by-step progression.** Even within the same module, you can't dump all requirements at once and pray. Break tasks into small pieces, accept each piece after completion, then reorganize context for the next piece. The cleaner and more focused the context you give it, the higher the output quality.

On top of these two dimensions, we also use an independent AI to review each commit, ensuring changes haven't exceeded the scope of the current task.

### 3.3 Acceptance: No Standards, No Right to Blame AI

This is the most important of the three segments. **Most dissatisfaction with AI Coding has its root cause in unclear acceptance standards.**

Back to the compiler case: why was the technical community's criticism invalid? Because the acceptance standard was "compile Linux," not "build a general-purpose compiler." Anything not written into your contract, the Agent has no obligation to implement. If you care whether Hello World compiles, write it into the test suite.

AI produces output at 100x human speed. At that velocity, a small drift that goes undetected will turn into a systemic problem across dozens of files within hours. You need to verify immediately after each step completes, confirming you haven't gone off track before proceeding.

Our approach is **front-loading the testing infrastructure**. After all implementation documents are generated and before the first line of business code is written, build a complete testing framework based on the API Contract. All dependencies that don't yet exist are replaced with Mock Servers and Mock data, constructing an independent test system decoupled from the entire service. If AI goes off track, the tests will immediately tell you.

If you find yourself unable to write tests, don't rush to write code — inability to write tests means your requirements were ambiguous from the start. Go back and fix the documentation.

> Any agent programming framework that includes no testing or quality control infrastructure can be uniformly classified as snake oil.

Beyond testing, **adversarial Code Review** provides another layer of assurance. After AI produces code, hand it to another AI (ideally a different model) to audit: did it strictly follow the implementation documents? The testing infrastructure verifies whether the results are correct; adversarial review verifies whether the process stayed within bounds. Two layers together form the deterministic boundary of the acceptance stage.

## IV. AI-Native Teams

Chapter III covered how to manage one Agent doing one thing. But in real projects, you won't run just one session. Members in our forum routinely orchestrate twenty to thirty Agents working in parallel as their daily norm.

When multiple Agents run in parallel, the infrastructure from Chapter III — API Contracts, Mock Servers, test suites — shifts from good practice to survival requirement. We tripped on this early: each Agent's individual output passed tests, but combined they had conflicts everywhere because the contracts between modules weren't defined tightly enough. The solution has no new tricks — it's the same fundamentals from Chapter III: make the contracts solid enough that each Agent works in a fully independent environment.

These practices have now been partially integrated into mainstream Coding Frameworks — for example, isolation through git worktree has become standard capability in both Cursor and Claude Code.

The technical coordination problem is solved. But once it was solved, a more fundamental question emerged: **how should people organize?**

One person driving thirty Agents produces output that already exceeds a traditional five-to-ten-person team. Productivity has changed, and organizational structures must change with it — just as the steam engine transformed craft workshops into factories, not because anyone decided factories were better, but because the workshop couldn't contain the new productive capacity.

The traditional structure of one Tech Lead over five or six ICs actually creates more coordination overhead when everyone can drive thirty Agents. We've observed two paths emerging: the Alpha Wolf model and the Tri-Ownership model our forum has been exploring.

### The Alpha Wolf's Ceiling

PingCAP's CTO Huang Dongxu demonstrated the power of the Alpha Wolf model in his Vibe Engineering practice: a single person driving large-scale Agent collaboration, using AI to rewrite TiDB's PostgreSQL compatibility layer with near-production code quality. He used an apt metaphor — an alpha wolf leading a pack through its own territory.

The advantages of the Alpha Wolf model are clear: extremely short decision chains, no communication overhead, one person's taste and judgment permeating the entire product. But it has two hard limits:

First, **it's very hard to have two alpha wolves in the same territory** — 1+1 < 2. Elite engineers each have their own highly personalized Agent workflows, prompt styles, and coding habits. Two top-tier engineers have a hard time collaborating in the same module because their Agent teams "speak different languages."

Second, **the ceiling is acceptance**. Dongxu himself said he spends 90% of his time evaluating AI's work output. With Dongxu's capabilities, he can handle it. But for most people, the Agent army produces output at 100x human speed — if acceptance can't keep up, you just end up with a faster-growing pile of technical debt. And alpha wolves themselves are extremely scarce.

The Alpha Wolf model proves the viability of AI-native development, but makes extreme demands on the individual.

### Decomposing the Super-Individual

A different approach: since super-individuals are hard to find, decompose the super-individual's capabilities and distribute them across three cultivatable roles.

**Product Owner (PO)** owns what gets built: defines product vision, manages user stories, sets priorities. The PO is accountable for the value of what gets delivered; the most important capability is knowing when to say "we're not building that."

**Tech Owner (TO)** owns how it gets built: leads the Agent army to complete all development. The core work is not writing code, but orchestrating multiple Agents' workflows, designing module boundaries, and handling anomalies during execution.

**Quality Owner (QO)** owns whether it's built right: independent of development, manages quality across the full process — from participating in defining acceptance criteria during the user story phase, to building the test framework, to final end-to-end acceptance. **The QO's independence is the linchpin of the entire framework.**

Returning to adversarial logic: the output delivered by a TO controlling an Agent army inherently needs an independent third party to verify. After the Challenger disaster, NASA established the Independent Verification and Validation project, whose core principle is that software verification must be executed by an organization independent of the developers. We're borrowing the same thinking.

You'll notice this team structure has no "programmer" role. Agents write the code. Humans define requirements, set boundaries, review output, and coordinate conflicts — all management work.

Two-person teams can also run this model: PO doubles as QO, partnered with a TO. Independence in acceptance is compromised, but for smaller projects it's sufficient.

### Outlook: Boundaries Will Gradually Relax

One clarification: all the practices discussed in this article target super-large, enterprise-scale AI Coding projects — writing a long-running database, a cloud collaboration tool, a commercial system that needs long-term maintenance. For small projects, you don't need this heavy a process.

What excites us even more is another direction. On some open-ended problems, we've found that letting the Agent plan its own path often produces results beyond expectations. You only define the high-level goal and let it conceive the approach, build its own tools, and iterate in a loop. The creativity AI exhibits in this autonomous mode frequently surprises us.

This may signal a trend: as model capabilities continue to grow, the "deterministic boundaries" we need to establish will become fewer and fewer. The granularity of management will shift from micro to macro, from "define every step" to "define the goal and let it execute." Today you need to write detailed implementation documents for AI to follow; maybe next year you'll only need to write a PRD; the year after that, just describe user stories. The deterministic boundaries won't disappear — but they'll continually abstract upward.

At the same time, AI's impact varies enormously across individuals: for the best practitioners it might be 10x, for average practitioners perhaps only 10%. AI is not a uniform efficiency booster — it's an amplifier, amplifying your management capability and systems thinking.

The "craft" that programmers take pride in is depreciating. But systems design capability, requirements analysis capability, and business understanding are becoming more critically important than ever before. An Agent can write anything you describe clearly, but it can't decide for you what should be written — because it is not itself the user of its own output.

If you derive satisfaction from creating things, you're living in the best of times. **Your ability to manage Agents is the ceiling on your creative capacity.**
