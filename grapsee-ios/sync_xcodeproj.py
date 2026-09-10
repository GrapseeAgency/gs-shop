#!/usr/bin/env python3
"""Regenerate GrapseeShop.xcodeproj file refs from the Swift sources on disk.
Deterministic md5-based IDs keep the project stable across runs.
Run after adding/removing Swift files:  python3 sync_xcodeproj.py"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(ROOT, "GrapseeShop")
PROJ = os.path.join(ROOT, "GrapseeShop.xcodeproj", "project.pbxproj")

def uid(s): return hashlib.md5(s.encode()).hexdigest()[:24].upper()

swift = []
for dp, _, fns in os.walk(APP):
    for f in sorted(fns):
        if f.endswith(".swift"):
            swift.append(os.path.relpath(os.path.join(dp, f), ROOT))

s = open(PROJ).read()

# 1. group paths so file refs resolve under GrapseeShop/
s = re.sub(r"(/\* GrapseeShop \*/ = \{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = \()", r"\1", s)
# main group gets path
s = s.replace("\t\t\tmainGroup", "\t\t\tmainGroup", 1)  # noop safeguard
# add path to each directory subgroup (name = X; -> path = X; name = X;)
def addpath(m):
    indent, name = m.group(1), m.group(2)
    return f"{indent}path = {name};\n{indent}name = {name};"
s2, n = re.subn(r"^(\t\t\t)name = (\w+);$", addpath, s, flags=re.M)
# only subgroups, not Products/mainGroup lines: revert Products + anything without children context is fine to keep
s = s2

# 2. ensure every swift file has fileRef + buildFile + sources entry
missing = [f for f in swift if os.path.basename(f) not in s or uid("file:" + f) not in s]
for f in missing:
    bn = os.path.basename(f)
    fid, bid = uid("file:" + f), uid("build:" + f)
    s = s.replace(
        "\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (",
        "\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t%s /* %s in Sources */," % (bid, bn), 1)
    s = s.replace(
        "\tobjects = {",
        "\tobjects = {\n\t\t%s /* %s in Sources */ = {isa = PBXBuildFile; fileRef = %s /* %s */; };\n\t\t%s /* %s */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = %s; sourceTree = \"<group>\"; };" % (bid, bn, fid, bn, fid, bn, bn), 1)
    # attach to its directory group
    d = os.path.basename(os.path.dirname(f))
    pat = re.compile(r"(\t\t\t%s /\* %s \*/ = \{\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = \()" % (uid("group:" + os.path.dirname(f)), d))
    s, c = pat.subn(r"\1\n\t\t\t\t%s /* %s */," % (fid, bn), s, count=1)
    print(("added " if c else "ORPHAN ") + f)

open(PROJ, "w").write(s)
print("sync done, missing were:", len(missing))
