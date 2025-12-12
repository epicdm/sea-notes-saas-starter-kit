"use client";

import { CallsPage } from "@/components/pages/CallsPage";
import { useRouter } from "next/navigation";

export default function Calls() {
  const router = useRouter();

  const handleViewCallDetail = (callId: string) => {
    router.push(`/calls/${callId}`);
  };

  return <CallsPage  onViewCallDetail={handleViewCallDetail} />;
}
