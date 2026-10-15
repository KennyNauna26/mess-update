-- Mess Update — database schema, ownership rules and Row Level Security.
-- Run once in Supabase → SQL Editor → New query. Safe to read top to bottom:
-- tables, then triggers, then RLS policies.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

-- Supabase owns auth.users, so app-specific user fields live here (1:1).
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 100),
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.mess_locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  latitude    double precision not null check (latitude between -90 and 90),
  longitude   double precision not null check (longitude between -180 and 180),
  created_at  timestamptz not null default now()
);

create table public.meals (
  id             uuid primary key default gen_random_uuid(),
  meal_date      date not null,
  meal_type      text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  main_dish      text not null check (char_length(main_dish) between 1 and 80),
  side_dish      text check (char_length(side_dish) <= 80),
  drink          text check (char_length(drink) <= 80),
  description    text check (char_length(description) <= 300),
  status         text not null default 'upcoming'
                   check (status in ('upcoming', 'serving', 'finished', 'unavailable')),
  serving_start  time not null,
  serving_end    time not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (meal_date, meal_type),
  check (serving_end > serving_start)
);

-- Queue levels are reported by an admin; the newest row is the current status.
create table public.queue_status (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.mess_locations (id) on delete cascade,
  status       text not null check (status in ('quiet', 'moderate', 'busy')),
  wait_min     integer not null check (wait_min >= 0),
  wait_max     integer not null,
  note         text check (char_length(note) <= 200),
  reported_at  timestamptz not null default now(),
  updated_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  check (wait_max >= wait_min)
);
create index queue_status_location_reported_idx on public.queue_status (location_id, reported_at desc);

-- The CRUD entity. user_id defaults to the caller so the client never sends it.
create table public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  meal_id     uuid not null references public.meals (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text not null default '' check (char_length(comment) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, meal_id)
);
create index feedback_user_created_idx on public.feedback (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger meals_set_updated_at before update on public.meals
  for each row execute function public.set_updated_at();
create trigger feedback_set_updated_at before update on public.feedback
  for each row execute function public.set_updated_at();

-- Create the profile row when someone signs up. full_name comes from signUp metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer so policies can check the role without recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Row Level Security — every table, no exceptions
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.mess_locations enable row level security;
alter table public.meals          enable row level security;
alter table public.queue_status   enable row level security;
alter table public.feedback       enable row level security;

-- profiles: a student sees and edits only their own row, and only full_name.
-- Column grants stop anyone promoting themselves to admin.
create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Reference data: any signed-in user reads, only admins write.
create policy "mess_locations: read" on public.mess_locations
  for select to authenticated using (true);
create policy "mess_locations: admin write" on public.mess_locations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "meals: read" on public.meals
  for select to authenticated using (true);
create policy "meals: admin write" on public.meals
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "queue_status: read" on public.queue_status
  for select to authenticated using (true);
create policy "queue_status: admin write" on public.queue_status
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- feedback: full CRUD on your own rows only. Ownership is enforced here, not in the app.
create policy "feedback: read own" on public.feedback
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "feedback: insert own" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "feedback: update own" on public.feedback
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "feedback: delete own" on public.feedback
  for delete to authenticated using ((select auth.uid()) = user_id);
-- Only rating and comment can change; a review cannot be moved to another meal or user.
revoke update on public.feedback from anon, authenticated;
grant update (rating, comment) on public.feedback to authenticated;
