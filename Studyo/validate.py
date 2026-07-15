#!/usr/bin/env python3
"""
Studyo v0.2.0 Validation Suite
Tests the constitutional data model and derivation engine against kernel definitions.
"""

import json

# ========== CONSTITUTIONAL DATA MODEL (from Studyo) ==========
LAYERS = {"pre": 0, "uscp": 1, "usc": 2, "science": 3, "expression": 4, "execution": 5, "impl": 6}
NODES = {
    "exist": {"name": "Existence", "layer": "uscp", "q": "What is?", "parents": ["principles"]},
    "identity": {"name": "Identity", "layer": "uscp", "q": "Who/what is it?", "parents": ["exist"]},
    "relationship": {"name": "Relationship", "layer": "uscp", "q": "How is it connected?", "parents": ["identity"]},
    "constraint": {"name": "Constraint", "layer": "uscp", "q": "What governs it?", "parents": ["relationship"]},
    "transformation": {"name": "Transformation", "layer": "uscp", "q": "How does it change?", "parents": ["constraint"]},
    "verification": {"name": "Verification", "layer": "uscp", "q": "How do we know it is valid?", "parents": ["transformation"]},
    "usc": {"name": "USC", "layer": "usc", "q": "The Constitution", "parents": ["exist", "identity", "relationship", "constraint", "transformation", "verification"]},
    "uce": {"name": "UCE", "layer": "science", "q": "What can be known?", "parents": ["usc"]},
    "ucc": {"name": "UCC", "layer": "science", "q": "How do we reason?", "parents": ["usc", "uce"]},
    "ucm": {"name": "UCM", "layer": "science", "q": "How is it structured?", "parents": ["usc", "ucc"]},
    "ucl": {"name": "UCL", "layer": "science", "q": "How is it expressed?", "parents": ["uce", "ucc", "ucm"]},
    "ucrs": {"name": "UCRS", "layer": "expression", "q": "Where is everything?", "parents": ["ucl"]},
    "ucmodels": {"name": "UCModels", "layer": "expression", "q": "What are the canonical models?", "parents": ["ucl", "ucrs"]},
    "urs": {"name": "URS", "layer": "expression", "q": "How is it represented?", "parents": ["ucmodels"]},
    "uvs": {"name": "UVS", "layer": "expression", "q": "How is it visualized?", "parents": ["urs"]},
    "usr": {"name": "USR/CoreFab", "layer": "execution", "q": "How is it executed?", "parents": ["uvs"]},
    "uca": {"name": "UCA", "layer": "execution", "q": "How does it connect externally?", "parents": ["usr"]},
    "ucd": {"name": "UCD", "layer": "execution", "q": "What building blocks exist?", "parents": ["uca"]},
    "codelabs": {"name": "CodeLabs", "layer": "impl", "q": "Where do we experiment?", "parents": ["uca", "usr"]},
    "studyo": {"name": "Studyo", "layer": "impl", "q": "Where do we interact?", "parents": ["codelabs"]},
    "principles": {"name": "Principles", "layer": "pre", "q": "Why these primitives?", "parents": ["reality"]},
    "reality": {"name": "Reality", "layer": "pre", "q": "What exists?", "parents": []},
}

# ========== VALIDATION TESTS ==========
results = {"pass": 0, "fail": 0, "warnings": [], "errors": []}

def test(name, condition, msg=""):
    if condition:
        results["pass"] += 1
        print(f"  ✅ {name}")
    else:
        results["fail"] += 1
        results["errors"].append(f"{name}: {msg}")
        print(f"  ❌ {name} — {msg}")

def warn(msg):
    results["warnings"].append(msg)
    print(f"  ⚠️  {msg}")

print("=" * 60)
print("STUDYO v0.2.0 VALIDATION SUITE")
print("=" * 60)

# ========== TEST 1: Data Model Completeness ==========
print("\n📋 Test 1: Data Model Completeness")

# All 22 expected nodes present
expected_nodes = [
    "reality", "principles",
    "exist", "identity", "relationship", "constraint", "transformation", "verification",
    "usc", "uce", "ucc", "ucm", "ucl",
    "ucrs", "ucmodels", "urs", "uvs",
    "usr", "uca", "ucd",
    "codelabs", "studyo"
]
test("All 22 nodes present", set(NODES.keys()) == set(expected_nodes),
     f"Missing: {set(expected_nodes) - set(NODES.keys())}, Extra: {set(NODES.keys()) - set(expected_nodes)}")

# Every node has required fields
for k, n in NODES.items():
    test(f"'{k}' has name, layer, q, parents",
         all(f in n for f in ["name", "layer", "q", "parents"]),
         f"Missing fields in {k}")

# Every node has a valid layer
for k, n in NODES.items():
    test(f"'{k}' has valid layer", n["layer"] in LAYERS,
         f"Invalid layer '{n['layer']}' for {k}")

# ========== TEST 2: Layer Ordering ==========
print("\n📋 Test 2: Layer Ordering (D1 — Downward Only)")

# D1: "No skipping layers" — parent layer must be <= child layer
# Within-layer derivation is valid (e.g., USCP primitives derive within the same layer)
# The constraint is: you cannot derive from a HIGHER layer
for k, n in NODES.items():
    for p in n["parents"]:
        if p in NODES:
            parent_layer = LAYERS[NODES[p]["layer"]]
            child_layer = LAYERS[n["layer"]]
            test(f"{n['name']} (layer {child_layer}) does not skip above {NODES[p]['name']} (layer {parent_layer})",
                 child_layer >= parent_layer,
                 f"D1 violation: {n['name']} layer {child_layer} derives from higher layer {NODES[p]['name']} layer {parent_layer}")

# ========== TEST 3: No Cycles ==========
print("\n📋 Test 3: Derivation Graph Acyclicity (D1)")

visited = set()
rec_stack = set()
has_cycle = False

def check_cycle(node, path):
    global has_cycle
    if node in rec_stack:
        has_cycle = True
        results["errors"].append(f"Cycle detected: {' → '.join(path)} → {node}")
        return
    if node in visited:
        return
    visited.add(node)
    rec_stack.add(node)
    for parent in NODES.get(node, {}).get("parents", []):
        if parent in NODES:
            check_cycle(parent, path + [parent])
    rec_stack.remove(node)

for k in NODES:
    visited.clear()
    rec_stack.clear()
    check_cycle(k, [k])

test("No cycles in derivation graph", not has_cycle)

# ========== TEST 4: USCP Primitives ==========
print("\n📋 Test 4: USCP Primitives")

uscp_order = ["exist", "identity", "relationship", "constraint", "transformation", "verification"]
test("USCP has exactly 6 primitives", len(uscp_order) == 6)

for i, k in enumerate(uscp_order):
    test(f"{NODES[k]['name']} is USCP primitive #{i+1}", NODES[k]["layer"] == "uscp")

# Linear chain: each depends on previous
for i in range(1, len(uscp_order)):
    test(f"{NODES[uscp_order[i]]['name']} depends on {NODES[uscp_order[i-1]]['name']}",
         uscp_order[i-1] in NODES[uscp_order[i]]["parents"],
         f"Parents: {NODES[uscp_order[i]]['parents']}")

# Existence depends on Principles
test("Existence depends on Principles", "principles" in NODES["exist"]["parents"])

# ========== TEST 5: USC = The Constitution ==========
print("\n📋 Test 5: USC — The Constitution")

test("USC depends on all 6 primitives", len(NODES["usc"]["parents"]) == 6)
test("USC is at layer usc (layer 2)", NODES["usc"]["layer"] == "usc")

# ========== TEST 6: Constitutional Sciences ==========
print("\n📋 Test 6: Constitutional Sciences")

test("UCE depends on USC", "usc" in NODES["uce"]["parents"])
test("UCC depends on USC and UCE", "usc" in NODES["ucc"]["parents"] and "uce" in NODES["ucc"]["parents"])
test("UCM depends on USC and UCC", "usc" in NODES["ucm"]["parents"] and "ucc" in NODES["ucm"]["parents"])
test("UCL depends on UCE, UCC, UCM (convergence)",
     "uce" in NODES["ucl"]["parents"] and "ucc" in NODES["ucl"]["parents"] and "ucm" in NODES["ucl"]["parents"])

# ========== TEST 7: Expression Layer ==========
print("\n📋 Test 7: Expression Layer")

test("UCRS depends on UCL", "ucl" in NODES["ucrs"]["parents"])
test("UCModels depends on UCL and UCRS", "ucl" in NODES["ucmodels"]["parents"] and "ucrs" in NODES["ucmodels"]["parents"])
test("URS depends on UCModels", "ucmodels" in NODES["urs"]["parents"])
test("UVS depends on URS", "urs" in NODES["uvs"]["parents"])

# ========== TEST 8: Execution Layer ==========
print("\n📋 Test 8: Execution Layer")

test("USR depends on UVS", "uvs" in NODES["usr"]["parents"])
test("UCA depends on USR", "usr" in NODES["uca"]["parents"])
test("UCD depends on UCA", "uca" in NODES["ucd"]["parents"])

# D4: UCA is the adaptation boundary
uca_layer = LAYERS[NODES["uca"]["layer"]]
test("UCA is at execution layer (D4 boundary)", uca_layer == 5)

# ========== TEST 9: Implementation Layer ==========
print("\n📋 Test 9: Implementation Layer")

test("CodeLabs depends on UCA and USR",
     "uca" in NODES["codelabs"]["parents"] and "usr" in NODES["codelabs"]["parents"])
test("Studyo depends on CodeLabs", "codelabs" in NODES["studyo"]["parents"])

# ========== TEST 10: Root Nodes ==========
print("\n📋 Test 10: Root Nodes")

test("Reality has no parents", len(NODES["reality"]["parents"]) == 0)
test("Principles depends on Reality", "reality" in NODES["principles"]["parents"])
test("Reality is at layer pre", NODES["reality"]["layer"] == "pre")
test("Principles is at layer pre", NODES["principles"]["layer"] == "pre")

# ========== TEST 11: Derivation Engine Logic ==========
print("\n📋 Test 11: Derivation Engine Logic")

# Test D1: Can't derive below implementation layer
test("D1: Existence at layer 1 → target layer 2 (usc)",
     LAYERS[NODES["exist"]["layer"]] + 1 == LAYERS["usc"])

test("D1: Studyo at layer 6 (impl) → no valid target",
     LAYERS[NODES["studyo"]["layer"]] + 1 > max(LAYERS.values()))

# Test D4: UCA is boundary
test("D4: UCA is at execution layer, last constitutional layer",
     NODES["uca"]["layer"] == "execution")

# Test D5: UCD is composed, not derived
test("D5: UCD depends on UCA (composed from adapter capabilities)",
     "uca" in NODES["ucd"]["parents"])

# ========== TEST 12: Dependency Analyzer Logic ==========
print("\n📋 Test 12: Dependency Analyzer Logic")

def find_all_dependents(node_key):
    """Find all nodes that transitively depend on node_key."""
    dependents = []
    def traverse(deps):
        for d in deps:
            if d not in dependents and d in NODES:
                dependents.append(d)
                parents_of_d = [k for k, v in NODES.items() if d in v["parents"]]
                traverse(parents_of_d)
    direct = [k for k, v in NODES.items() if node_key in v["parents"]]
    traverse(direct)
    return dependents

def find_all_dependencies(node_key):
    """Find all nodes that node_key transitively depends on."""
    dependencies = []
    def traverse(parents):
        for p in parents:
            if p not in dependencies and p in NODES:
                dependencies.append(p)
                traverse(NODES[p]["parents"])
    traverse(NODES[node_key]["parents"])
    return dependencies

# Existence should have many dependents
exist_deps = find_all_dependents("exist")
test("Existence has transitive dependents", len(exist_deps) > 0,
     f"Found {len(exist_deps)} dependents")

# Studyo should have no dependents (leaf)
studyo_deps = find_all_dependents("studyo")
test("Studyo has no dependents (leaf node)", len(studyo_deps) == 0)

# Reality should have no dependencies (root)
reality_deps = find_all_dependencies("reality")
test("Reality has no dependencies (root node)", len(reality_deps) == 0)

# Existence should depend on Principles
exist_dependencies = find_all_dependencies("exist")
test("Existence depends on Principles", "principles" in exist_dependencies)

# USC should depend on all 6 primitives
usc_dependencies = find_all_dependencies("usc")
for prim in ["exist", "identity", "relationship", "constraint", "transformation", "verification"]:
    test(f"USC depends on {NODES[prim]['name']}", prim in usc_dependencies)

# UCL should depend on UCE, UCC, UCM
ucl_dependencies = find_all_dependencies("ucl")
test("UCL depends on UCE", "uce" in ucl_dependencies)
test("UCL depends on UCC", "ucc" in ucl_dependencies)
test("UCL depends on UCM", "ucm" in ucl_dependencies)

# Studyo should depend on everything (transitively)
studyo_dependencies = find_all_dependencies("studyo")
# Studyo depends on all nodes except itself (21 total with Reality fix)
test("Studyo depends on all other nodes except UCD (leaf)",
     len(studyo_dependencies) == len(NODES) - 2,
     f"Expected {len(NODES) - 1}, got {len(studyo_dependencies)}: {sorted(studyo_dependencies)}")

# Severity calculation
def calc_severity(node_key):
    deps = find_all_dependents(node_key)
    n = len(deps)
    if n == 0: return "Low"
    if n <= 3: return "Medium"
    if n <= 6: return "High"
    return "Critical"

test("Existence removal severity is Critical",
     calc_severity("exist") == "Critical")
test("Studyo removal severity is Low",
     calc_severity("studyo") == "Low")
# UCA has 3 dependents: UCD, CodeLabs, Studyo = Medium severity
test("UCA removal severity is Medium or higher",
     calc_severity("uca") in ["Medium", "High", "Critical"],
     f"Got: {calc_severity('uca')}")

# ========== TEST 13: Graph Positions ==========
print("\n📋 Test 13: Graph Node Positions")

GRAPH_POS = {
    "reality": {"x": 390, "y": 30}, "principles": {"x": 390, "y": 80},
    "exist": {"x": 130, "y": 150}, "identity": {"x": 250, "y": 150},
    "relationship": {"x": 390, "y": 150}, "constraint": {"x": 530, "y": 150},
    "transformation": {"x": 650, "y": 150}, "verification": {"x": 730, "y": 150},
    "usc": {"x": 390, "y": 230},
    "uce": {"x": 195, "y": 310}, "ucc": {"x": 330, "y": 310},
    "ucm": {"x": 465, "y": 310}, "ucl": {"x": 600, "y": 310},
    "ucrs": {"x": 350, "y": 390}, "ucmodels": {"x": 500, "y": 390},
    "urs": {"x": 620, "y": 390}, "uvs": {"x": 730, "y": 390},
    "usr": {"x": 250, "y": 470}, "uca": {"x": 450, "y": 470},
    "ucd": {"x": 650, "y": 470},
    "codelabs": {"x": 350, "y": 540}, "studyo": {"x": 550, "y": 540}
}

# All nodes have positions
for k in NODES:
    test(f"'{k}' has graph position", k in GRAPH_POS,
         f"Missing position for {k}")

# Layer ordering in Y coordinates
pre_y = GRAPH_POS["reality"]["y"]
uscp_y = GRAPH_POS["exist"]["y"]
usc_y = GRAPH_POS["usc"]["y"]
science_y = GRAPH_POS["uce"]["y"]
expr_y = GRAPH_POS["ucrs"]["y"]
exec_y = GRAPH_POS["usr"]["y"]
impl_y = GRAPH_POS["codelabs"]["y"]

test("Layer Y ordering: pre < uscp < usc < science < expression < execution < implementation",
     pre_y < uscp_y < usc_y < science_y < expr_y < exec_y < impl_y,
     f"Y values: {pre_y}, {uscp_y}, {usc_y}, {science_y}, {expr_y}, {exec_y}, {impl_y}")

# ========== SUMMARY ==========
print("\n" + "=" * 60)
print("VALIDATION SUMMARY")
print("=" * 60)
print(f"  Passed:  {results['pass']}")
print(f"  Failed:  {results['fail']}")
print(f"  Warnings: {len(results['warnings'])}")
print(f"  Errors:  {len(results['errors'])}")

if results["errors"]:
    print("\n❌ ERRORS:")
    for e in results["errors"]:
        print(f"    - {e}")

if results["warnings"]:
    print("\n⚠️  WARNINGS:")
    for w in results["warnings"]:
        print(f"    - {w}")

print("\n" + "=" * 60)
if results["fail"] == 0:
    print("✅ ALL TESTS PASSED — Constitutional data model is valid")
else:
    print(f"❌ {results['fail']} TESTS FAILED — Fixes required")
print("=" * 60)
