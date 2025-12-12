#!/usr/bin/env bash
set -e

echo "=== Agent-3 Environment Setup: BEGIN ==="

PROJECT_ROOT="$(pwd)"

# ---------------------------------------------------------------------
# 0) Require that we are in the frontend project
# ---------------------------------------------------------------------
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: No package.json found. Run this script from your Next.js project root."
  exit 1
fi

echo "📁 Project root confirmed: $PROJECT_ROOT"

# ---------------------------------------------------------------------
# 1) Ensure core dependencies
# ---------------------------------------------------------------------
echo "🔧 Checking Node / npm..."

if ! command -v node &> /dev/null; then
  echo "❌ Node is not installed — please install Node 18+ then re-run."
  exit 1
else
  echo "✅ Node version: $(node -v)"
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm missing — install it and re-run."
  exit 1
fi

# Install dependencies
echo "📦 Installing JS dependencies..."
npm install

# ---------------------------------------------------------------------
# 2) Create .claude config directory
# ---------------------------------------------------------------------
CLAUDE_DIR=".claude"

echo "📂 Creating .claude config folder..."
mkdir -p "$CLAUDE_DIR"

create_if_missing () {
  local path="$CLAUDE_DIR/$1"
  local content="$2"
  if [ -f "$path" ]; then
    echo "    ↳ [skip] $path already exists"
  else
    echo "    ↳ [create] $path"
    echo "$content" > "$path"
  fi
}

# ---------------------------------------------------------------------
# 3) Write all policy files (Agent-3 bundle)
# ---------------------------------------------------------------------
create_if_missing "system.md" \
"# SYSTEM (core instructions)
You are an autonomous senior engineer operating in AGENT-3 MODE.
Follow replit-style constraints in replit-style.md.
Use minimal safe diffs. Ask only when needed."

create_if_missing "replit-style.md" \
"# Replit-Style Rules
(Short set — full policy should be inserted here if desired)
• Work iteratively
• Minimal diffs
• Inspect → plan → patch → test → repeat
• Auto-discover and fix related issues
• Do not rewrite large sections unless confirmed
"

create_if_missing "pm.md" \
"# Project-Management Rules
• Break requests into milestones
• Prioritize by risk & impact
• Identify dependencies
• Summarize next steps
"

create_if_missing "editor.md" \
"# Editor Rules
• Always minimal diffs
• Fix LSP issues
• Summarize file changes
"

create_if_missing "workflow.md" \
"# Workflow Loop (AGENT-3)
1) Understand
2) Inspect code
3) Plan minimal changes
4) Patch
5) Test
6) Iterate
"

create_if_missing "context.md" \
"TECH CONTEXT:
- Next.js 15
- NextAuth v5
- LiveKit
- Typescript
- HeroUI
"

create_if_missing "agent3.md" \
"# Agent-3 Session Modes

## START
You are now AGENT-3.
Proactively implement, test and iterate.

## LOOP
1) Inspect
2) Plan
3) Patch minimal diff
4) Self-test
5) If broken → fix again
6) Summarize

## EXIT
Produce summary + follow-ups
"

# ---------------------------------------------------------------------
# 4) Optional: install git hooks
# ---------------------------------------------------------------------
GIT_HOOKS_DIR=".git/hooks"
mkdir -p "$GIT_HOOKS_DIR"

PRE_COMMIT="$GIT_HOOKS_DIR/pre-commit"
if [ ! -f "$PRE_COMMIT" ]; then
  echo "⚙️ Creating simple git pre-commit hook..."
  cat << 'EOF' > "$PRE_COMMIT"
#!/bin/sh
echo "🔎 Running pre-commit formatting..."
npx --yes prettier . --write
EOF
  chmod +x "$PRE_COMMIT"
else
  echo "    ↳ [skip] pre-commit hook exists"
fi

# ---------------------------------------------------------------------
# 5) Create helper alias for invoking SC easily
# ---------------------------------------------------------------------
if ! grep -q "alias scstart" ~/.bashrc; then
  echo "Adding scstart alias to ~/.bashrc"
  echo 'alias scstart="echo \"Start with /sc:pm in AGENT-3 mode\"" ' >> ~/.bashrc
else
  echo "    ↳ [skip] alias exists"
fi

# ---------------------------------------------------------------------
# 6) Final verification
# ---------------------------------------------------------------------
echo
echo "✅ .claude folder contents:"
ls -la "$CLAUDE_DIR"

echo
echo "✨ Agent-3 environment installed successfully!"
echo "   You may now open this project in Claude Code."
echo
echo "📌 Recommended first command inside Claude Code:"
echo "    /sc:pm Launch AGENT-3 analysis"
echo
echo "=== Agent-3 Environment Setup: COMPLETE ==="
