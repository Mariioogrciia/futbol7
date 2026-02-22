"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuthClient() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Small timeout to allow Next hydration
        setTimeout(() => router.replace("/login"), 50);
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  return null;
}
