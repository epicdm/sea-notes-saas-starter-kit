#!/bin/bash

echo "🔧 Fixing all remaining relative imports..."

# Fix all files in app/dashboard
find app/dashboard -name "*.tsx" -type f | while read file; do
  echo "Fixing: $file"

  # Replace ALL ui imports with absolute path
  sed -i 's|from "\.\./\.\./\.\./ui/|from "@/components/ui/|g' "$file"
  sed -i 's|from "\.\./\.\./ui/|from "@/components/ui/|g' "$file"
  sed -i 's|from "\.\./ui/|from "@/components/ui/|g' "$file"
  sed -i "s|from '\.\./\.\./\.\./ui/|from '@/components/ui/|g" "$file"
  sed -i "s|from '\.\./\.\./ui/|from '@/components/ui/|g" "$file"
  sed -i "s|from '\.\./ui/|from '@/components/ui/|g" "$file"

  # Replace ALL utils imports with absolute path
  sed -i 's|from "\.\./\.\./\.\./utils/|from "@/utils/|g' "$file"
  sed -i 's|from "\.\./\.\./utils/|from "@/utils/|g' "$file"
  sed -i 's|from "\.\./utils/|from "@/utils/|g' "$file"
  sed -i "s|from '\.\./\.\./\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from '\.\./\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from '\.\./utils/|from '@/utils/|g" "$file"

  # Replace ALL component imports with absolute path
  sed -i 's|from "\.\./\.\./\.\./components/|from "@/components/|g' "$file"
  sed -i 's|from "\.\./\.\./|from "@/components/|g' "$file"
  sed -i 's|from "\.\./|from "@/components/|g' "$file"
  sed -i "s|from '\.\./\.\./\.\./components/|from '@/components/|g" "$file"
  sed -i "s|from '\.\./\.\./|from '@/components/|g" "$file"
  sed -i "s|from '\.\./|from '@/components/|g" "$file"

  # Replace ALL lib imports with absolute path
  sed -i 's|from "\.\./\.\./\.\./lib/|from "@/lib/|g' "$file"
  sed -i 's|from "\.\./\.\./lib/|from "@/lib/|g' "$file"
  sed -i 's|from "\.\./lib/|from "@/lib/|g' "$file"
  sed -i "s|from '\.\./\.\./\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from '\.\./\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from '\.\./lib/|from '@/lib/|g" "$file"
done

# Fix all component files
find components -name "*.tsx" -type f | while read file; do
  echo "Fixing: $file"

  # Fix UI imports in components
  sed -i 's|from "\.\./ui/|from "@/components/ui/|g' "$file"
  sed -i 's|from "./ui/|from "@/components/ui/|g' "$file"
  sed -i "s|from '\.\./ui/|from '@/components/ui/|g" "$file"
  sed -i "s|from './ui/|from '@/components/ui/|g" "$file"

  # Fix peer component imports
  sed -i 's|from "\.\./|from "@/components/|g' "$file"
  sed -i 's|from "./|from "@/components/|g' "$file"
  sed -i "s|from '\.\./|from '@/components/|g" "$file"
  sed -i "s|from './|from '@/components/|g" "$file"

  # Fix utils imports
  sed -i 's|from "\.\./\.\./utils/|from "@/utils/|g' "$file"
  sed -i 's|from "\.\./utils/|from "@/utils/|g' "$file"
  sed -i "s|from '\.\./\.\./utils/|from '@/utils/|g" "$file"
  sed -i "s|from '\.\./utils/|from '@/utils/|g" "$file"

  # Fix lib imports
  sed -i 's|from "\.\./\.\./lib/|from "@/lib/|g' "$file"
  sed -i 's|from "\.\./lib/|from "@/lib/|g' "$file"
  sed -i "s|from '\.\./\.\./lib/|from '@/lib/|g" "$file"
  sed -i "s|from '\.\./lib/|from '@/lib/|g" "$file"
done

echo "✅ All imports fixed!"
