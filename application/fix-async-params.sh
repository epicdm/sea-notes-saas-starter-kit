#!/bin/bash

# Script to fix Next.js 15 async params in API routes
# This script updates all API route handlers to use Promise-wrapped params

set -e

echo "🔧 Fixing async params in API routes..."

# List of files to fix (excluding already fixed ones)
FILES=(
  "app/api/admin-api/users/[userId]/route.ts"
  "app/api/live-listen/rooms/[roomName]/join/route.ts"
  "app/api/transcripts/call/[callLogId]/route.ts"
  "app/api/user/agents/[id]/deploy/route.ts"
  "app/api/user/agents/[id]/livekit-info/route.ts"
  "app/api/user/agents/[id]/undeploy/route.ts"
  "app/api/user/campaigns/[id]/route.ts"
  "app/api/user/campaigns/[id]/schedule/route.ts"
  "app/api/user/leads/[id]/route.ts"
  "app/api/user/personas/[id]/route.ts"
  "app/api/user/phone-numbers/[phoneNumber]/assign/route.ts"
  "app/api/user/phone-numbers/[phoneNumber]/route.ts"
  "app/api/user/phone-numbers/[phoneNumber]/unassign/route.ts"
  "app/api/v1/agents/[id]/route.ts"
  "app/api/v1/calls/[id]/route.ts"
  "app/api/webhooks/[id]/deliveries/route.ts"
  "app/api/webhooks/[id]/route.ts"
  "app/api/webhooks/[id]/test/route.ts"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  echo "📝 Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Fix param types (various parameter names)
  # Match patterns like: { params }: { params: { id: string } }
  # Replace with: { params }: { params: Promise<{ id: string }> }
  sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"

  echo "✅ Fixed: $file"
done

echo ""
echo "🎯 Summary:"
echo "  - Fixed ${#FILES[@]} API route files"
echo "  - Backups saved with .bak extension"
echo ""
echo "⚠️  IMPORTANT: Manual fixes still needed for param extraction"
echo "  Each function body needs: const { paramName } = await params;"
echo ""
