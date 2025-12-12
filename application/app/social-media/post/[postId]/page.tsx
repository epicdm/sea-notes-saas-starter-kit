"use client";

import { SocialPostDetailPage } from "@/components/pages/SocialPostDetailPage";
import { useRouter, useParams } from "next/navigation";

export default function SocialPostDetail() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;

  return (
    <SocialPostDetailPage
      postId={postId}
      
      onBack={() => router.push("/social-media")}
    />
  );
}
