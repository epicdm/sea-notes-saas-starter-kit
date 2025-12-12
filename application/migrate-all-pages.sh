#!/bin/bash
# Migrate ALL pages from new site to Next.js

SOURCE_DIR="/tmp/Aiagentmanagementappgui/src/components/pages"
DEST_BASE="app/dashboard"

echo "🚀 Starting full page migration..."

# Map: SourceFile → DestinationPath
declare -A PAGE_MAP=(
  ["DashboardPage.tsx"]="page.tsx"
  ["AgentsPage.tsx"]="agents/page.tsx"
  ["AnalyticsPage.tsx"]="analytics/page.tsx"
  ["ApiKeysPage.tsx"]="api-keys/page.tsx"
  ["BillingPage.tsx"]="billing/page.tsx"
  ["CallsPage.tsx"]="calls/page.tsx"
  ["CallDetailPage.tsx"]="calls/[id]/page.tsx"
  ["CampaignsPage.tsx"]="campaigns/page.tsx"
  ["CampaignDetailPage.tsx"]="campaigns/[id]/page.tsx"
  ["FunnelsPage.tsx"]="funnels/page.tsx"
  ["FunnelDetailPage.tsx"]="funnels/[id]/page.tsx"
  ["LeadsPage.tsx"]="leads/page.tsx"
  ["LiveCallsPage.tsx"]="live-listen/page.tsx"
  ["MarketplacePage.tsx"]="marketplace/page.tsx"
  ["PersonasPage.tsx"]="personas/page.tsx"
  ["PhoneNumbersPage.tsx"]="phone-numbers/page.tsx"
  ["SettingsPage.tsx"]="settings/page.tsx"
  ["SocialMediaPage.tsx"]="social-media/page.tsx"
  ["SocialMediaCalendarPage.tsx"]="social-media/calendar/page.tsx"
  ["SocialPostDetailPage.tsx"]="social-media/[id]/page.tsx"
  ["TestingPage.tsx"]="testing/page.tsx"
  ["WebhooksPage.tsx"]="integrations/webhooks/page.tsx"
  ["WhiteLabelPage.tsx"]="white-label/page.tsx"
)

for SOURCE_FILE in "${!PAGE_MAP[@]}"; do
  DEST_PATH="${PAGE_MAP[$SOURCE_FILE]}"
  DEST_DIR=$(dirname "$DEST_BASE/$DEST_PATH")

  echo "📄 Converting $SOURCE_FILE → $DEST_PATH"

  # Create directory if needed
  mkdir -p "$DEST_DIR"

  # Run conversion
  ./convert-page.sh "$SOURCE_DIR/$SOURCE_FILE" "$DEST_BASE/$DEST_PATH"
done

echo ""
echo "✅ Migration complete! Converted ${#PAGE_MAP[@]} pages"
echo ""
echo "📋 Next steps:"
echo "  1. Check for TypeScript errors"
echo "  2. Fix import paths"
echo "  3. Test each page"
