-- Run in Supabase SQL Editor. Also create Storage bucket "reels" in Dashboard (Storage -> New bucket, name: reels, Public).

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  title text,
  created_at timestamptz not null default now()
);

alter table public.reels enable row level security;

drop policy if exists "Anyone can read reels" on public.reels;
create policy "Anyone can read reels"
  on public.reels for select using (true);

drop policy if exists "Users can insert own" on public.reels;
create policy "Users can insert own"
  on public.reels for insert with check (auth.uid() = user_id);
