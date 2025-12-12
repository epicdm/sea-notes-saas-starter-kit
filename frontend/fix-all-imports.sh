#!/bin/bash

echo "🔧 Fixing import paths across all migrated files..."

# Fix imports in all page files
echo "Fixing page imports..."
find app/dashboard -name "*.tsx" -type f | while read file; do
  # Remove version tags from imports (e.g., sonner@1.2.3 -> sonner)
  sed -i 's/@[0-9]\+\.[0-9]\+\.[0-9]\+//g' "$file"

  # Fix utility imports to use @/ prefix
  sed -i "s|from '\.\./\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from '\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from 'utils/|from '@/utils/|g" "$file"

  # Fix component imports
  sed -i "s|from '\.\./\.\./components/|from '@/components/|g" "$file"
  sed -i "s|from '\.\./components/|from '@/components/|g" "$file"
  sed -i "s|from 'components/|from '@/components/|g" "$file"

  # Fix UI component imports
  sed -i "s|from '\.\./ui/|from '@/components/ui/|g" "$file"
  sed -i "s|from 'ui/|from '@/components/ui/|g" "$file"

  # Fix lib imports
  sed -i "s|from '\.\./\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from '\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from 'lib/|from '@/lib/|g" "$file"

  # Fix supabase path (if using supabase, it should be in lib)
  sed -i "s|@/utils/supabase|@/lib/supabase|g" "$file"
done

# Fix imports in component files
echo "Fixing component imports..."
find components -name "*.tsx" -type f | while read file; do
  # Remove version tags from imports
  sed -i 's/@[0-9]\+\.[0-9]\+\.[0-9]\+//g' "$file"

  # Fix utility imports
  sed -i "s|from '\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from 'utils/|from '@/utils/|g" "$file"

  # Fix component imports (peer components)
  sed -i "s|from '\.\./components/|from '@/components/|g" "$file"
  sed -i "s|from 'components/|from '@/components/|g" "$file"

  # Fix UI component imports (relative within components)
  sed -i "s|from '\.\./ui/|from '@/components/ui/|g" "$file"
  sed -i "s|from 'ui/|from '@/components/ui/|g" "$file"

  # Fix lib imports
  sed -i "s|from '\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from 'lib/|from '@/lib/|g" "$file"

  # Fix supabase path
  sed -i "s|@/utils/supabase|@/lib/supabase|g" "$file"
done

echo "✅ Import paths fixed!"
