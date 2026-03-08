-- Run in Supabase SQL Editor after reels table exists.
create table if not exists public.saved_reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, reel_id)
);

alter table public.saved_reels enable row level security;

drop policy if exists "Users can read own saved" on public.saved_reels;
create policy "Users can read own saved"
  on public.saved_reels for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved" on public.saved_reels;
create policy "Users can insert own saved"
  on public.saved_reels for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved" on public.saved_reels;
create policy "Users can delete own saved"
  on public.saved_reels for delete using (auth.uid() = user_id);
