#!/usr/bin/env python3
"""Strict validator for GrapseeShop.xcodeproj. Fails loudly on anything Xcode
would choke on: unbalanced braces, dangling refs, wrong file paths, sources
missing from the target, Swift files on disk missing from the project.

Usage: python3 scripts/validate_xcodeproj.py  (exit 0 = clean)
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PBX = os.path.join(ROOT, "GrapseeShop.xcodeproj", "project.pbxproj")
APP = os.path.join(ROOT, "GrapseeShop")

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def main() -> int:
    try:
        s = open(PBX).read()
    except FileNotFoundError:
        print("MISSING project.pbxproj")
        return 1

    if s.count("{") != s.count("}"):
        err(f"unbalanced braces")

    defined = set(re.findall(r"^\t\t([0-9A-F]{24})", s, re.M))
    for m in re.finditer(r"\b([0-9A-F]{24})\b", s):
        if m.group(1) not in defined:
            err(f"dangling reference {m.group(1)}")

    filerefs: dict[str, str] = {}
    for m in re.finditer(
        r"^\t\t([0-9A-F]{24}) /\* (.+?) \*/ = \{isa = PBXFileReference;.*?path = ([^;]+); sourceTree = \"<group>\"",
        s,
        re.M,
    ):
        filerefs[m.group(1)] = m.group(3).strip()

    groups: dict[str, tuple[list[str], str | None]] = {}
    for m in re.finditer(
        r"^\t\t([0-9A-F]{24})(?: /\* ([^*]+?) \*/)? = \{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = \((.*?)\);\n(?:\t\t\tpath = ([^;\n]+);\n)?",
        s,
        re.S | re.M,
    ):
        gid = m.group(1)
        kids = re.findall(r"\b([0-9A-F]{24})\b", m.group(3))
        groups[gid] = (kids, m.group(4).strip() if m.group(4) else None)

    main_group = re.search(r"mainGroup = ([0-9A-F]+);", s)
    if not main_group:
        err("no mainGroup")
        print_report()
        return 1

    resolved: dict[str, str] = {}

    def walk(gid: str, prefix: str) -> None:
        kids, path = groups.get(gid, ([], None))
        here = os.path.join(prefix, path) if path else prefix
        for kid in kids:
            if kid in filerefs:
                resolved[kid] = os.path.normpath(os.path.join(here, filerefs[kid]))
            elif kid in groups:
                walk(kid, here)

    walk(main_group.group(1), ROOT)

    for fid, disk in sorted(resolved.items()):
        if disk.endswith((".swift", ".plist")) and not os.path.isfile(disk):
            err(f"missing on disk: {os.path.relpath(disk, ROOT)}")

    on_disk = set()
    for dp, _, fns in os.walk(APP):
        for f in fns:
            if f.endswith(".swift"):
                on_disk.add(os.path.relpath(os.path.join(dp, f), ROOT))
    referenced = {os.path.relpath(os.path.join(ROOT, d), ROOT) for d in resolved.values() if d.endswith(".swift")}
    for f in sorted(on_disk - referenced):
        err(f"on disk but NOT in project: {f}")

    build_refs = set()
    for m in re.finditer(r"isa = PBXBuildFile; fileRef = ([0-9A-F]{24})", s):
        build_refs.add(m.group(1))
    for fid, disk in resolved.items():
        if disk.endswith(".swift") and fid not in build_refs:
            err(f"in project but NOT compiled: {os.path.relpath(disk, ROOT)}")

    m = re.search(r"INFOPLIST_FILE = ([^;]+);", s)
    if m and not os.path.isfile(os.path.join(ROOT, m.group(1).strip())):
        err(f"INFOPLIST_FILE missing: {m.group(1)}")

    print_report()
    return 1 if errors else 0


def print_report() -> None:
    if errors:
        print(f"INVALID: {len(errors)} problem(s)")
        for e in errors:
            print(" -", e)
    else:
        print("VALID: project file is consistent")


if __name__ == "__main__":
    sys.exit(main())
