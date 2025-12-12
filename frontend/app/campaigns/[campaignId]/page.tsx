"use client";

import { CampaignDetailPage } from "@/components/pages/CampaignDetailPage";
import { useRouter, useParams } from "next/navigation";

export default function CampaignDetail() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  return (
    <CampaignDetailPage
      campaignId={campaignId}
      
      onBack={() => router.push("/campaigns")}
    />
  );
}
