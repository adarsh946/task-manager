export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  created_by: string;
  assigned_to: string;
  created_at: string;
  creator: User;
  assignee: User;
}
