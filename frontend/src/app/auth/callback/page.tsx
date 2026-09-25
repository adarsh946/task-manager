"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken } from "@/lib/auth";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      saveToken(token);
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Logging you in...</p>
    </main>
  );
}
