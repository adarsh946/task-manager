"use client";
import { Task } from "@/types";
import { apiFetch } from "@/lib/api";

interface Props {
  task: Task;
  onUpdate: () => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[task.status]
          }`}
        >
          {statusLabels[task.status]}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-500 text-sm">{task.description}</p>
      )}

      <div className="flex gap-3 text-sm text-gray-500">
        {task.creator && (
          <div className="flex items-center gap-1">
            <span>Created by:</span>
            <span className="font-medium text-gray-700">
              {task.creator.name}
            </span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <span>Assigned to:</span>
            <span className="font-medium text-gray-700">
              {task.assignee.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-1 flex-wrap">
        {task.status !== "in_progress" && task.status !== "completed" && (
          <button
            onClick={() => updateStatus("in_progress")}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
          >
            Start
          </button>
        )}
        {task.status !== "completed" && (
          <button
            onClick={() => updateStatus("completed")}
            className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
          >
            Complete
          </button>
        )}
        <button
          onClick={deleteTask}
          className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
