-- Run in Supabase SQL Editor after reels table exists.
create table if not exists public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid references public.reels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.reel_comments enable row level security;

drop policy if exists "Anyone can read reel_comments" on public.reel_comments;
create policy "Anyone can read reel_comments"
  on public.reel_comments for select to public using (true);

drop policy if exists "Users can insert own comment" on public.reel_comments;
create policy "Users can insert own comment"
  on public.reel_comments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comment" on public.reel_comments;
create policy "Users can delete own comment"
  on public.reel_comments for delete using (auth.uid() = user_id);
