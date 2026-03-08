-- Run in Supabase SQL Editor.
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Anyone can read follows" on public.follows;
create policy "Anyone can read follows"
  on public.follows for select to public using (true);

drop policy if exists "Users can insert own follow" on public.follows;
create policy "Users can insert own follow"
  on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "Users can delete own follow" on public.follows;
create policy "Users can delete own follow"
  on public.follows for delete using (auth.uid() = follower_id);
