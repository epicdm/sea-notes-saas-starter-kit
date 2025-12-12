"use client";

import { FunnelsPage } from "@/components/pages/FunnelsPage";
import { useRouter } from "next/navigation";

export default function Funnels() {
  const router = useRouter();

  const handleViewFunnel = (funnelId: string) => {
    router.push(`/funnels/${funnelId}`);
  };

  return (
    <FunnelsPage
      
      onNavigate={(page) => router.push(`/${page}`)}
      onViewFunnel={handleViewFunnel}
    />
  );
}
