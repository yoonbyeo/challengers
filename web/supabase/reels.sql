-- Run in Supabase SQL Editor.
-- 1. Create Storage bucket "reels" in Dashboard: Storage -> New bucket, name: reels, Public.
-- 2. Run this file, then run the Storage policy below (or in a second run) so uploads succeed.

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
  on public.reels for select to public using (true);

drop policy if exists "Users can insert own" on public.reels;
create policy "Users can insert own"
  on public.reels for insert with check (auth.uid() = user_id);

-- Storage: allow authenticated users to upload into their own folder (path: {user_id}/...)
-- Run this after the "reels" bucket exists (Storage -> New bucket -> reels, Public).
drop policy if exists "Users can upload to own folder" on storage.objects;
create policy "Users can upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'reels'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: allow anyone (anon + authenticated) to read reels files so all users see uploaded videos
drop policy if exists "Public can read reels files" on storage.objects;
create policy "Public can read reels files"
  on storage.objects for select to public
  using (bucket_id = 'reels');
