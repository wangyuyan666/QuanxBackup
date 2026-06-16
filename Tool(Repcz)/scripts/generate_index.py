#!/usr/bin/env python3
"""
仓库文件搜索索引生成器
扫描仓库中所有文件，生成 docs/search_index.json 用于 GitHub Pages 搜索功能
"""

import json
import os
import mimetypes
from datetime import datetime, timezone

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(REPO_ROOT, "docs")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "search_index.json")

# 需要排除的目录/文件
EXCLUDE_DIRS = {
    ".git",
    ".github",
    "__pycache__",
    "node_modules",
    ".vscode",
}

EXCLUDE_FILES = {
    ".DS_Store",
    "search_index.json",
}

# 平台映射（目录名 → 显示名）
PLATFORM_MAP = {
    "sing-box": "sing-box",
    "QuantumultX": "Quantumult X",
    "Surge": "Surge",
    "Shadowrocket": "Shadowrocket",
    "Stash": "Stash",
    "Surfboard": "Surfboard",
    "Loon": "Loon",
    "Egern": "Egern",
    "LanceX": "LanceX",
    "mihomo": "mihomo",
    "GeoIP": "GeoIP",
}

# 分类关键词映射
CATEGORY_KEYWORDS = {
    "Rules": ("Rules", "rules"),
    "Script": ("Script", "script"),
    "Module": ("Module", "module"),
    "Config": ("Config", "config", ".conf", ".json"),
    "Override": ("Override", "override"),
    "GeoIP": ("GeoIP", "geoip", ".mmdb"),
    "Custom": ("Custom", "custom"),
    "Server": ("Server", "server"),
    "Client": ("Client", "client"),
}

TEXT_EXTENSIONS = {
    ".json", ".srs", ".list", ".yaml", ".yml", ".conf",
    ".txt", ".md", ".js", ".sgmodule", ".stoverride",
    ".lsr", ".mmdb",
}


def get_platform(path_parts: tuple) -> str:
    """从路径推断所属平台"""
    for part in path_parts:
        if part in PLATFORM_MAP:
            return PLATFORM_MAP[part]
    return "Other"


def get_category(path: str, path_parts: tuple) -> str:
    """从路径推断文件分类"""
    ext = os.path.splitext(path)[1].lower()

    # GeoIP 特殊处理
    if ext == ".mmdb" or "GeoIP" in path_parts:
        return "GeoIP"

    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in path_parts or kw in path:
                return category

    # 根据扩展名兜底
    if ext in (".conf", ".json", ".yaml", ".yml"):
        return "Config"
    if ext == ".js":
        return "Script"
    if ext in (".sgmodule", ".stoverride", ".lsr"):
        return "Module"

    return "Other"


def count_lines(filepath: str) -> int:
    """统计文本文件行数"""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def get_file_info(filepath: str, rel_path: str) -> dict:
    """获取单个文件信息"""
    path_parts = tuple(rel_path.split(os.sep))
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    size = os.path.getsize(filepath)
    mtime = os.path.getmtime(filepath)

    # 获取 git 最后修改时间（如果有）
    last_modified = datetime.fromtimestamp(mtime, tz=timezone.utc).astimezone().isoformat()

    info = {
        "path": rel_path,
        "name": filename,
        "ext": ext,
        "platform": get_platform(path_parts),
        "category": get_category(rel_path, path_parts),
        "size": size,
        "size_display": format_size(size),
        "lines": count_lines(filepath) if ext in TEXT_EXTENSIONS else 0,
        "last_modified": last_modified,
    }
    return info


def format_size(size: int) -> str:
    """格式化文件大小"""
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    else:
        return f"{size / 1024 / 1024:.1f} MB"


def scan_repository() -> list:
    """扫描仓库，收集所有文件信息"""
    files = []
    for root, dirs, filenames in os.walk(REPO_ROOT):
        # 排除不需要扫描的目录
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        # 跳过 .git 等
        rel_root = os.path.relpath(root, REPO_ROOT)
        if rel_root.startswith(tuple(EXCLUDE_DIRS)):
            continue

        for filename in sorted(filenames):
            if filename in EXCLUDE_FILES:
                continue
            if filename.startswith("."):
                continue

            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, REPO_ROOT)

            if not os.path.isfile(filepath):
                continue

            try:
                info = get_file_info(filepath, rel_path)
                files.append(info)
            except Exception as e:
                print(f"  [!] 跳过 {rel_path}: {e}")

    return files


def build_index() -> dict:
    """构建完整的搜索索引"""
    print(f"[*] 扫描仓库: {REPO_ROOT}")
    files = scan_repository()
    print(f"    -> 发现 {len(files)} 个文件")

    # 按平台分组统计
    platform_stats = {}
    for f in files:
        p = f["platform"]
        platform_stats[p] = platform_stats.get(p, 0) + 1

    # 按分类分组统计
    category_stats = {}
    for f in files:
        c = f["category"]
        category_stats[c] = category_stats.get(c, 0) + 1

    index = {
        "updated": datetime.now(timezone.utc).astimezone().isoformat(),
        "total_files": len(files),
        "platforms": sorted(platform_stats.keys()),
        "categories": sorted(category_stats.keys()),
        "platform_stats": platform_stats,
        "category_stats": category_stats,
        "files": files,
    }

    return index


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    index = build_index()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"\n[*] 索引已写入: {OUTPUT_FILE}")
    print(f"    - 文件总数: {index['total_files']}")
    print(f"    - 平台数: {len(index['platforms'])}")
    print(f"    - 分类数: {len(index['categories'])}")

    # 打印统计信息
    print("\n[*] 各平台文件数:")
    for p, c in sorted(index["platform_stats"].items()):
        print(f"    {p}: {c}")
    print("\n[*] 各分类文件数:")
    for c, n in sorted(index["category_stats"].items()):
        print(f"    {c}: {n}")


if __name__ == "__main__":
    main()
