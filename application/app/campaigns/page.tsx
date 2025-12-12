"use client";

import { CampaignsPage } from "@/components/pages/CampaignsPage";
import { useRouter } from "next/navigation";

export default function Campaigns() {
  const router = useRouter();

  const handleViewDetail = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  return <CampaignsPage  onViewDetail={handleViewDetail} />;
}
