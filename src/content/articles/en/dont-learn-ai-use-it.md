---
title: Stop Learning AI. Start Using It.
description: The best way to learn AI is to skip the learning and solve a real business problem. A $40/month store assistant case shows why starting from problems beats starting from technology.
author: magong
date: 2026-04-06
tags: [ai-practice, north-star-metric, business-first]
---

A friend asked me: "How should I start learning AI?" My answer: don't. Just use it.

That sounds blunt, but I mean it. Look at what people who are "learning AI" actually do. Someone decides to start with linear algebra. They hear the English textbooks are better than the Chinese ones, so they buy an English textbook. They can't read it, so they start studying English. Three months later: linear algebra unfinished, English not improved, zero lines of AI code written. Training models is "learning AI." Optimizing inference is "learning AI." Tuning agent cache hit rates is "learning AI." These require completely different skills and lead to completely different careers. You haven't figured out where you're going, so what exactly are you studying for?

Some people will quote the old saying about diligence being the path to knowledge. That was true in ancient times. A scholar could spend ten years studying the Analects and still benefit at sixty. The Prompt Engineering you spent six months learning this year will be worthless next year. In the 1990s, computer training schools taught kids Wubi typing. Kids practiced until they could type 80 characters per minute. Then Pinyin input came along and made the whole skill irrelevant.

There are things in AI that won't change for decades. But as a beginner, you can't tell which those are. If you could, you wouldn't be a beginner.

Engineering has a concept called knowledge half-life: how long before half of what you learned becomes obsolete. Civil engineering's half-life is about fifty years. Software engineering is two to three years. AI, I estimate, is under one year. Planning a ten-year study roadmap with one-year half-life knowledge is a losing bet no matter how you calculate it.

AI has changed learning itself. You used to either know a domain or you didn't, stuck at whatever level. Now you can have a conversation with AI and pull your understanding of any domain up to "good enough." How much knowledge you've stockpiled no longer determines your ceiling.

## Collecting Stamps Is Not Using AI

There's another type of person who tries every AI tool: Midjourney for images, ChatGPT for memos, Suno for music, Cursor for a few lines of code. They feel like they're deep into AI. But ask them what real change AI has brought to their work, and they can't answer.

This is hoarding. They've saved hundreds of prompt templates, followed twenty AI newsletters, bookmarked hundreds of "read later" tutorials. Bookmarking feels like learning. None of it gets used.

Some have a dozen AI apps on their phone, each with a paid subscription, spending hundreds of dollars a month. I asked one of them what they'd accomplished with AI recently. After thinking for a while, they said: "Last week I used ChatGPT to write a book report for my kid."

You're spending hundreds a month on subscriptions to write a book report?

## Find Your North Star

My advice: pick one specific business scenario, start small, and set yourself a North Star metric. A North Star metric is a concrete, measurable business outcome. Not "I want to use AI to improve efficiency" -- that's empty talk. Something like "I spend 6 hours a week sorting through client RFQ emails; I want to see if AI can cut that to 1 hour." Six hours to one hour. That's your North Star. Once you have that metric, you'll know exactly what tools you need.

## A $40/Month Store Manager Assistant

At our [Agents Zone](https://agentszone.ai) forum session #20, David shared a project he built in Hong Kong: an AI store manager assistant for a chain of fresh meat shops.

Fresh meat shops aren't sophisticated. Beyond a cash register, they have nothing. No inventory management, no spoilage tracking, no purchasing plans. A whole pig goes in; ribs, pork belly, and shredded meat come out. The units don't match up, and the register data can't reconstruct inventory. The owner's daily anxiety: how much meat is left today, how much should I order tomorrow? Nobody can say. It's like knowing your wallet is $500 lighter today but not knowing whether you spent it on food, a taxi, or dropped it on the street. Staring at the balance will never help you manage your money.

David's North Star was clear: make daily inventory data go from "guessing" to "accurate and queryable."

He built a conventional backend: database, API, access control, everything you'd expect. Then he added an AI layer on top, connected to WhatsApp. The store manager says into their phone: "Three jin of ribs left, pork belly is gone." The AI translates that into an API call and updates inventory automatically.

That's it. AI's role here is a translator -- turning human language into machine language. Data storage, business logic, access control: all handled by traditional software. AI just listens and understands.

The LLM runs on DeepSeek or Qwen. API costs about $15/month. Add a cloud server, total under $40. Traditional inventory management systems from legacy vendors cost tens of thousands per year, and employees don't use them -- they're shelfware. David spends $40/month, employees use it every day, because it's just sending a voice message on WhatsApp.

David didn't need to read twenty transformer papers. Every design decision was driven by that North Star metric: where is the data pipeline broken, what interaction method will employees actually use, how to decompose a fuzzy management problem into chunks AI can handle.

## Start from the Problem, Not from AI

From a technical perspective, this is nothing impressive. Speech-to-text plus intent recognition, elementary-level reasoning. But from a business perspective, this solves a problem the fresh food industry hasn't solved in decades.

This is the fundamental reason I'm against "learning AI." When you start from AI and search for problems, you find pseudo-problems: "how to make the model smarter," "how to write better prompts," "how to build a multi-agent system." For someone trying to improve their business with AI, all of that is irrelevant.

When you start from a problem and search for AI, you find real needs. The actual requirements from the business are "the 50-year-old store manager won't fill in Excel" and "you can't touch a mouse while carrying crates." The solution doesn't need Claude Opus or any frontier model. Last year's DeepSeek handles it fine.

A community member, Xu Wu, put it well: how many businesses in China's smaller cities make a few million yuan in annual profit, can't afford enterprise SaaS at tens of thousands per year, but genuinely need inventory and staff management? These businesses are AI's biggest battlefield. Not every AI application needs to "disrupt" something. Sometimes just lowering the barrier to entry is disruption enough.

## Stuck? Find Your People

David's solution didn't come from working alone. He shared, discussed, and iterated in the community. Others gave feedback, he refined. After hearing David's presentation, another member was inspired. His company handles landscaping procurement quotes: suppliers send voice quotes, AI extracts prices, compares against historical quotes, and generates procurement reports. Same pattern as David's: AI translates, traditional systems compute. If we'd each worked alone, we'd probably have wasted six months on avoidable mistakes.

Tonight, spend half an hour writing down the most annoying task from your week. Don't overthink it, just write: "I spend X hours per week doing Y, and I hate it." Paste that into ChatGPT or DeepSeek and ask: can AI simplify this? It'll give you a bunch of suggestions, most of them useless. But one or two will make you think "hm, that's worth trying." Pick one and try it tomorrow. Don't aim for perfection -- just get the smallest possible piece working. David started with one single action: "store manager says one sentence on WhatsApp and inventory updates."

You'll hit problems along the way. That's when you need to talk to people who've done something similar. Our Agents Zone forum has people sharing their real projects every week. David's and the landscaping solutions were both shaped through these conversations. The forum is at [agentszone.ai](https://agentszone.ai).

---

*Originally written in Chinese. Translated by the author.*
