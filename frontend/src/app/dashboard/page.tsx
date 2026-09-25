"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Task, User } from "@/types";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

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
      } else setUser(data);
    });

    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    const data = await apiFetch("/tasks/");
    setTasks(data);
  };

  const fetchUsers = async () => {
    const data = await apiFetch("/users/");
    setUsers(data);
  };

  const logout = () => {
    removeToken();
    router.push("/");
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Loading your dashboard…
          </p>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar_url}
              className="w-11 h-11 rounded-full ring-2 ring-blue-100 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-200"
            >
              <span className="text-base leading-none">+</span> New Task
            </button>
            <button
              onClick={logout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center bg-white text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 active:scale-[0.98] transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Your Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"} shown
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          {["all", "pending", "in_progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "in_progress"
                ? "In Progress"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 px-6 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              No tasks found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Create a new task to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              <span className="text-base leading-none">+</span> New Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateTaskModal
          users={users}
          onClose={() => setShowModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </main>
  );
}
