#!/bin/bash
# Convert a page component from new site to Next.js format

SOURCE_FILE=$1
DEST_FILE=$2

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Error: Source file $SOURCE_FILE not found"
  exit 1
fi

# Copy file
cp "$SOURCE_FILE" "$DEST_FILE"

# Add 'use client' directive at the top
sed -i "1i'use client'\n" "$DEST_FILE"

# Change named export to default export
sed -i 's/export function \([A-Za-z]*Page\)/export default function \1/' "$DEST_FILE"

# Remove version from sonner import
sed -i 's/@[0-9]\+\.[0-9]\+\.[0-9]\+//g' "$DEST_FILE"

# Fix import paths (remove ../../ and use @/)
sed -i "s|from '\.\./\.\./utils/|from '@/utils/|g" "$DEST_FILE"
sed -i "s|from '\.\./ui/|from '@/components/ui/|g" "$DEST_FILE"
sed -i "s|from '\.\./\.\./|from '@/components/|g" "$DEST_FILE"

# Add useSession import if accessToken prop exists
if grep -q "accessToken:" "$DEST_FILE"; then
  # Add import after 'use client'
  sed -i "2i import { useSession } from 'next-auth/react'" "$DEST_FILE"

  # Replace accessToken prop with useSession hook
  # This is tricky - we'll add a comment for manual fix
  sed -i "s/interface \([A-Za-z]*Props\) {/interface \1 {\n  \/\/ TODO: Remove accessToken prop, use useSession() hook instead/" "$DEST_FILE"
fi

echo "✅ Converted: $DEST_FILE"
