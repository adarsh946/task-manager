"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface User {
  user_id: string;
  email: string;
  name: string;
  avatar_url: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    apiFetch("/auth/me").then((data) => {
      if (data.error) {
        removeToken();
        router.push("/");
      } else {
        setUser(data);
      }
    });
  }, []);

  const logout = () => {
    removeToken();
    router.push("/");
  };

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img src={user.avatar_url} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
        <p className="text-gray-500">Tasks will appear here soon...</p>
      </div>
    </main>
  );
}
