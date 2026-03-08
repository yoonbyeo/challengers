-- Run in Supabase SQL Editor after reels table exists.
create table if not exists public.reel_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, reel_id)
);

alter table public.reel_likes enable row level security;

drop policy if exists "Anyone can read reel_likes" on public.reel_likes;
create policy "Anyone can read reel_likes"
  on public.reel_likes for select to public using (true);

drop policy if exists "Users can insert own like" on public.reel_likes;
create policy "Users can insert own like"
  on public.reel_likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own like" on public.reel_likes;
create policy "Users can delete own like"
  on public.reel_likes for delete using (auth.uid() = user_id);
