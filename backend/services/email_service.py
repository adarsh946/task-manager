def send_task_assigned_email(to_email, to_name, task_title, task_description, creator_name):
    print(f"[EMAIL] Task assigned email to {to_email}")
    print(f"  Task: {task_title} by {creator_name}")


def send_task_completed_email(to_email, to_name, task_title):
    print(f"[EMAIL] Task completed email to {to_email}")
    print(f"  Task: {task_title}")
