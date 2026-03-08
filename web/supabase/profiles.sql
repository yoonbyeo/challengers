-- Run this in Supabase SQL Editor to create the profiles table.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  display_name text,
  coins integer not null default 0
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
