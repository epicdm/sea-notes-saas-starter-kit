#!/usr/bin/env bash
set -e

TARGET_USER="agent3"
TARGET_HOME="/home/$TARGET_USER"
PROJECT_ROOT="${1:-$(pwd)}"
PLUGIN_DIR="$PROJECT_ROOT/.claude-plugin"
SC_DIR="$PLUGIN_DIR/superclaude"
SC_REPO="https://github.com/SuperClaude-Org/SuperClaude_Framework.git"

echo "=== SuperClaude v2 Installer ==="
echo "Project Root: $PROJECT_ROOT"
echo

### 1) verify project dir exists
if [[ ! -d "$PROJECT_ROOT" ]]; then
  echo "❌ ERROR: Project folder not found: $PROJECT_ROOT"
  exit 1
fi

### 2) create plugin folder if missing
mkdir -p "$PLUGIN_DIR"
echo "✅ Ensured: $PLUGIN_DIR"

### 3) If SC already exists
if [[ -d "$SC_DIR" ]]; then
  echo "⚠️  SuperClaude already exists at:"
  echo "    $SC_DIR"
  echo
  read -r -p "Update from GitHub? (y/N) " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      echo "🔄 Updating SuperClaude…"
      cd "$SC_DIR"
      git pull --rebase
      echo "✅ Updated."
  else
      echo "➡️  Leaving existing SuperClaude untouched."
  fi
else
  ### 4) Clone fresh
  echo "⬇️  Installing SuperClaude (v2)..."
  git clone "$SC_REPO" "$SC_DIR"
  echo "✅ Clone complete."
fi

### 5) Ensure correct owner
echo "🔧 Fixing ownership..."
chown -R "$TARGET_USER":"$TARGET_USER" "$PLUGIN_DIR"

### 6) Verify structure
if [[ ! -f "$SC_DIR/package.json" ]]; then
  echo "❌ ERROR: SuperClaude incomplete — package.json missing!"
  exit 1
fi

echo "✅ Verified: package.json present"

### 7) Optional local build
cd "$SC_DIR"
echo "📦 Running npm install…"
sudo -u "$TARGET_USER" npm install >/dev/null 2>&1 || echo "⚠️ npm install warnings ignored"

echo "✅ Dependencies installed"

echo
echo "=== ✅ SUPERCLAUDE v2 READY ==="
echo
echo "Location:"
echo "   $SC_DIR"
echo
echo "Next steps:"
echo "   sudo -iu $TARGET_USER"
echo "   cd $PROJECT_ROOT"
echo "   claude --dangerously-skip-permissions"
echo
echo "Expected startup messages:"
echo "   • PM Agent initializing"
echo "   • Index plugin loading"
echo "   • Research agent available"
echo

echo "✅ Try: (inside Claude Code session)"
echo "   PM: diagnose project"
echo
