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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-10 py-10 flex flex-col items-center gap-5 max-w-sm w-full text-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Logging you in…
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Please wait a moment while we sign you in.
          </p>
        </div>
      </div>
    </div>
  );
}
