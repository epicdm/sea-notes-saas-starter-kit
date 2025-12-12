"use client";

import { SocialMediaPage } from "@/components/pages/SocialMediaPage";
import { useRouter } from "next/navigation";

export default function SocialMedia() {
  const router = useRouter();

  return (
    <SocialMediaPage
      
      onNavigate={(page) => router.push(`/${page}`)}
      onViewCalendar={() => router.push("/social-media/calendar")}
      onViewPost={(postId) => router.push(`/social-media/post/${postId}`)}
    />
  );
}
