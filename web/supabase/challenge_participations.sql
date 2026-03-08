-- Run in Supabase SQL Editor to create challenge participations table.

create table if not exists public.challenge_participations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, challenge_id)
);

alter table public.challenge_participations enable row level security;

drop policy if exists "Anyone can read counts" on public.challenge_participations;
create policy "Anyone can read counts"
  on public.challenge_participations for select using (true);

drop policy if exists "Users can insert own" on public.challenge_participations;
create policy "Users can insert own"
  on public.challenge_participations for insert with check (auth.uid() = user_id);
