"use client";

import { FunnelDetailPage } from "@/components/pages/FunnelDetailPage";
import { useRouter, useParams } from "next/navigation";

export default function FunnelDetail() {
  const router = useRouter();
  const params = useParams();
  const funnelId = params.funnelId as string;

  return (
    <FunnelDetailPage
      funnelId={funnelId}
      
      onBack={() => router.push("/funnels")}
    />
  );
}
