-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  google_id text unique not null,
  avatar_url text,
  refresh_token text,
  created_at timestamp default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'pending',
  created_by uuid references users(id),
  assigned_to uuid references users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);