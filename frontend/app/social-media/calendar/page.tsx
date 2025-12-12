"use client";

import { SocialMediaCalendarPage } from "@/components/pages/SocialMediaCalendarPage";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SocialCalendar() {
  const router = useRouter();
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <SocialMediaCalendarPage
      
      onBack={() => router.push("/social-media")}
      onCreatePost={() => setShowCreatePost(true)}
      onViewPost={(postId) => router.push(`/social-media/post/${postId}`)}
    />
  );
}
