"use client";
import { useEffect } from "react";
import { isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
        <p className="text-gray-500">Sign in to manage your tasks</p>

        <a
          href={`${BACKEND_URL}/auth/login`}
          className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Sign in with Google
        </a>
      </div>
    </main>
  );
}
