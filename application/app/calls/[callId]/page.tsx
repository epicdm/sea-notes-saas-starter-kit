"use client";

import { CallDetailPage } from "@/components/pages/CallDetailPage";
import { useRouter, useParams } from "next/navigation";

export default function CallDetail() {
  const router = useRouter();
  const params = useParams();
  const callId = params.callId as string;

  return (
    <CallDetailPage
      callId={callId}
      
      onBack={() => router.push("/calls")}
    />
  );
}
