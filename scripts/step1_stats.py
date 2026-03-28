#!/usr/bin/env python3
"""
step1_stats.py — 从成员名单+summaries精确统计每人的影响力

用法：python scripts/step1_stats.py ~/aichat/chats/27587714869_AI_Coding
"""

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

# 别名映射：同一人的不同名字 → 统一名
ALIASES = {
    '陈明.ai': '陈明',
    '王欢.ai': '王欢',
    # 按需添加
}

BOTS = {'AI群聊总结助手', 'Muxso AI Gateway', 'GPT'}


def normalize_name(name: str) -> str:
    """统一别名。"""
    return ALIASES.get(name, name)


def load_members_and_ats(chat_dir: Path) -> tuple[list[str], dict[str, int]]:
    """一次遍历JSON，同时收集成员名和@提及。"""
    names = set()
    at_counts = defaultdict(int)
    
    # 来源1：_members.json
    members_file = chat_dir / '_members.json'
    if members_file.exists():
        data = json.loads(members_file.read_text(encoding='utf-8'))
        for user in data.get('users', []):
            dn = user.get('displayName', '').strip()
            if dn and len(dn) >= 2:
                names.add(normalize_name(dn))
    
    # 来源2：遍历JSON（同时取senderName和@提及）
    for jf in sorted(chat_dir.glob('*.json')):
        if jf.name.startswith('_'):
            continue
        try:
            msgs = json.loads(jf.read_text(encoding='utf-8'))
            if not isinstance(msgs, list):
                continue
            for msg in msgs:
                sn = msg.get('senderName', '').strip()
                if sn and len(sn) >= 2:
                    names.add(normalize_name(sn))
                content = msg.get('content', '')
                for m in re.finditer(r'@([\S]+)', content):
                    at_counts[normalize_name(m.group(1))] += 1
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
    
    names -= BOTS
    # 按长度降序——先匹配长名
    sorted_names = sorted(names, key=len, reverse=True)
    return sorted_names, dict(at_counts)


def scan_summaries(chat_dir: Path, known_names: list[str]) -> dict:
    """用成员名单在summaries中做精确匹配。"""
    summaries_dir = chat_dir / 'summaries'
    
    user_data = defaultdict(lambda: {
        'mention_count': 0,
        'topics': [],
        'files': [],
        'first_seen': None,
        'last_seen': None,
    })
    
    for md in sorted(summaries_dir.glob('*.md')):
        text = md.read_text(encoding='utf-8')
        filename = md.name
        
        date_match = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
        date_str = date_match.group(1) if date_match else None
        
        # 提取主题
        topic = re.sub(r'^\d{4}-\d{2}-\d{2}(-\d{2}-\d{2})?-?', '', filename.replace('.md', ''))
        
        # 精确匹配成员名单
        # 先匹配长名（known_names已按长度降序），已匹配的文本位置标记跳过
        found_in_file = set()
        matched_spans = []
        for name in known_names:
            if name in found_in_file:
                continue
            idx = text.find(name)
            if idx == -1:
                continue
            # 检查是否被更长的名字覆盖
            overlapped = any(s <= idx < e for s, e in matched_spans)
            if overlapped:
                continue
            found_in_file.add(name)
            matched_spans.append((idx, idx + len(name)))
        
        for name in found_in_file:
            ud = user_data[name]
            ud['mention_count'] += 1
            if topic and topic not in ud['topics']:
                ud['topics'].append(topic)
            ud['files'].append(filename)
            if date_str:
                if not ud['first_seen'] or date_str < ud['first_seen']:
                    ud['first_seen'] = date_str
                if not ud['last_seen'] or date_str > ud['last_seen']:
                    ud['last_seen'] = date_str
    
    return dict(user_data)


def compute_influence(mentions: int, ats: int, topics: int) -> tuple[str, float]:
    """计算影响力等级和分数。"""
    score = (0.3 * min(mentions / 20, 1) +
             0.4 * min(ats / 10, 1) +
             0.2 * min(topics / 5, 1) +
             0.1)
    
    if score >= 0.7:
        return 'core', round(score, 3)
    elif score >= 0.4:
        return 'active', round(score, 3)
    else:
        return 'contributor', round(score, 3)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('chat_dir')
    parser.add_argument('--top', type=int, default=20)
    parser.add_argument('--output', default='scripts/user_stats.json')
    args = parser.parse_args()
    
    chat_dir = Path(args.chat_dir)
    
    print("Loading members + @mentions (single pass)...")
    known_names, at_counts = load_members_and_ats(chat_dir)
    print(f"  {len(known_names)} members, {len(at_counts)} with @mentions")
    
    print("Scanning summaries...")
    user_data = scan_summaries(chat_dir, known_names)
    print(f"  {len(user_data)} members found in summaries")
    
    # 合并
    results = []
    all_names = set(list(user_data.keys()) + list(at_counts.keys()))
    for name in all_names:
        ud = user_data.get(name, {'mention_count': 0, 'topics': [], 'first_seen': None, 'last_seen': None, 'files': []})
        ats = at_counts.get(name, 0)
        influence, score = compute_influence(ud['mention_count'], ats, len(ud['topics']))
        
        results.append({
            'name': name,
            'mention_count': ud['mention_count'],
            'at_count': ats,
            'topic_count': len(ud['topics']),
            'topics': ud['topics'][:10],
            'influence': influence,
            'influence_score': score,
            'first_seen': ud['first_seen'],
            'last_seen': ud['last_seen'],
        })
    
    results.sort(key=lambda x: x['influence_score'], reverse=True)
    results = results[:args.top]
    
    Path(args.output).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    
    print(f"\nTop {len(results)}:")
    print(f"{'Name':<25} {'Summ':>5} {'@':>5} {'Topics':>6} {'Score':>6} {'Level':<12} {'Since'}")
    print('-' * 80)
    for r in results:
        print(f"{r['name']:<25} {r['mention_count']:>5} {r['at_count']:>5} {r['topic_count']:>6} {r['influence_score']:>6} {r['influence']:<12} {r['first_seen']}")
    
    print(f"\nSaved to {args.output}")


if __name__ == '__main__':
    main()
