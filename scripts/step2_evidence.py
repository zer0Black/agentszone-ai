#!/usr/bin/env python3
"""
step2_evidence.py — 从 summaries 中为每人提取代表性引用

用法：python scripts/step2_evidence.py ~/aichat/chats/27587714869_AI_Coding --stats scripts/user_stats.json
"""

import argparse
import json
import re
from pathlib import Path


def extract_user_quotes(summary_text: str, name: str) -> list[dict]:
    """从一个summary中提取某人的引用。
    
    返回：[{type: 'raw_quote'|'summary_mention', text: str, context: str}]
    """
    quotes = []
    lines = summary_text.split('\n')
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # 类型1：Raw Context 里的直接引用 "某某: 发言内容"
        raw_match = re.match(rf'^{re.escape(name)}[:：]\s*(.+)', stripped)
        if raw_match:
            text = raw_match.group(1).strip()
            if len(text) > 10:  # 过滤太短的（"对""好的"）
                quotes.append({
                    'type': 'raw_quote',
                    'text': text[:300],
                    'weight': 3,
                })
            continue
        
        # 类型2：Summary 里提到此人的段落
        if name in stripped and len(stripped) > 20:
            # 提取包含此人名的完整句子
            sentences = re.split(r'[。.!！?？]', stripped)
            for sent in sentences:
                if name in sent and len(sent) > 15:
                    quotes.append({
                        'type': 'summary_mention',
                        'text': sent.strip()[:300],
                        'weight': 2,
                    })
    
    return quotes


def select_top_evidence(all_quotes: list[dict], n: int = 5) -> list[dict]:
    """选最有代表性的N条引用。
    
    策略：
    1. raw_quote优先（是本人原话）
    2. 按长度排序（更长=更有内容）
    3. 去重（相似内容只保留一条）
    """
    # 按权重×长度排序
    scored = [(q, q['weight'] * min(len(q['text']), 200)) for q in all_quotes]
    scored.sort(key=lambda x: x[1], reverse=True)
    
    selected = []
    seen_texts = set()
    for q, _ in scored:
        # 简单去重：前30字相同算重复
        key = q['text'][:30]
        if key in seen_texts:
            continue
        seen_texts.add(key)
        selected.append(q)
        if len(selected) >= n:
            break
    
    return selected


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('chat_dir')
    parser.add_argument('--stats', default='scripts/user_stats.json')
    parser.add_argument('--output', default='scripts/user_evidence.json')
    parser.add_argument('--top-quotes', type=int, default=5)
    args = parser.parse_args()
    
    chat_dir = Path(args.chat_dir)
    summaries_dir = chat_dir / 'summaries'
    
    # 加载 step1 的统计结果
    stats = json.loads(Path(args.stats).read_text(encoding='utf-8'))
    target_names = {s['name'] for s in stats}
    
    print(f"Extracting evidence for {len(target_names)} users...")
    
    # 为每人收集所有引用
    user_quotes = {name: [] for name in target_names}
    
    for md in sorted(summaries_dir.glob('*.md')):
        text = md.read_text(encoding='utf-8')
        filename = md.name
        
        # 提取主题
        topic = re.sub(r'^\d{4}-\d{2}-\d{2}(-\d{2}-\d{2})?-?', '', filename.replace('.md', ''))
        
        for name in target_names:
            if name in text:
                quotes = extract_user_quotes(text, name)
                for q in quotes:
                    q['source'] = filename
                    q['topic'] = topic
                user_quotes[name].extend(quotes)
    
    # 为每人选top N
    results = []
    for stat in stats:
        name = stat['name']
        quotes = user_quotes.get(name, [])
        top = select_top_evidence(quotes, args.top_quotes)
        
        results.append({
            **stat,
            'total_quotes': len(quotes),
            'evidence': top,
        })
    
    Path(args.output).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    
    print(f"\nEvidence extracted:")
    print(f"{'Name':<25} {'Total':>6} {'Selected':>8} {'Raw':>4} {'Summary':>8}")
    print('-' * 60)
    for r in results:
        raw = sum(1 for e in r['evidence'] if e['type'] == 'raw_quote')
        summ = sum(1 for e in r['evidence'] if e['type'] == 'summary_mention')
        print(f"{r['name']:<25} {r['total_quotes']:>6} {len(r['evidence']):>8} {raw:>4} {summ:>8}")
    
    print(f"\nSaved to {args.output}")


if __name__ == '__main__':
    main()
