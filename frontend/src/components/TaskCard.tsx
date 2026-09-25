"use client";
import { Task } from "@/types";
import { apiFetch } from "@/lib/api";

interface Props {
  task: Task;
  onUpdate: () => void;
}

const statusColors = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function TaskCard({ task, onUpdate }: Props) {
  const updateStatus = async (status: string) => {
    await apiFetch(`/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    onUpdate();
  };

  const deleteTask = async () => {
    await apiFetch(`/tasks/${task.id}`, { method: "DELETE" });
    onUpdate();
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-snug break-words min-w-0">
          {task.title}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            statusColors[task.status]
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          {statusLabels[task.status]}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {task.description}
        </p>
      )}

      {(task.creator || task.assignee) && (
        <div className="flex flex-col gap-1.5 text-sm text-gray-500 pt-3 border-t border-gray-100">
          {task.creator && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-400">Created by:</span>
              <span className="font-medium text-gray-700 truncate">
                {task.creator.name}
              </span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-gray-400">Assigned to:</span>
              <span className="font-medium text-gray-700 truncate">
                {task.assignee.name}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto flex-wrap">
        {task.status !== "in_progress" && task.status !== "completed" && (
          <button
            onClick={() => updateStatus("in_progress")}
            className="text-xs font-medium bg-blue-600 text-white px-3.5 py-2 rounded-lg shadow-sm hover:bg-blue-700 active:scale-[0.97] transition-all duration-200"
          >
            Start
          </button>
        )}
        {task.status !== "completed" && (
          <button
            onClick={() => updateStatus("completed")}
            className="text-xs font-medium bg-green-600 text-white px-3.5 py-2 rounded-lg shadow-sm hover:bg-green-700 active:scale-[0.97] transition-all duration-200"
          >
            Complete
          </button>
        )}
        <button
          onClick={deleteTask}
          className="ml-auto text-xs font-medium text-red-600 px-3.5 py-2 rounded-lg hover:bg-red-50 active:scale-[0.97] transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
