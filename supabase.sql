-- Oasis minimal schema
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- helper role functions
create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists(select 1 from public.profiles where id = uid and role = 'admin');
$$ language sql stable;

create or replace function public.is_staff(uid uuid)
returns boolean as $$
  select exists(select 1 from public.profiles where id = uid and role in ('staff','admin'));
$$ language sql stable;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin','staff','customer')),
  created_at timestamptz default now()
);

-- events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ticket types
create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  capacity int,
  created_at timestamptz not null default now()
);

-- tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id) on delete cascade,
  token_hash text unique not null,
  status text not null default 'valid',
  redeemed_at timestamptz,
  redeemed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- checkins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  scanned_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists tickets_event_token_idx on public.tickets(event_id, token_hash);
create index if not exists tickets_redeemed_idx on public.tickets(redeemed_at);
create index if not exists checkins_event_idx on public.checkins(event_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.tickets enable row level security;
alter table public.checkins enable row level security;

-- profiles policies
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or is_admin(auth.uid()));
create policy "admin insert profiles" on public.profiles
  for insert with check (is_admin(auth.uid()));
create policy "admin update profiles" on public.profiles
  for update using (is_admin(auth.uid()));

-- events policies
create policy "events read auth" on public.events
  for select using (auth.role() = 'authenticated');
create policy "events admin write" on public.events
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- ticket_types policies
create policy "ticket_types read auth" on public.ticket_types
  for select using (auth.role() = 'authenticated');
create policy "ticket_types admin write" on public.ticket_types
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- tickets policies
create policy "tickets staff read" on public.tickets
  for select using (is_staff(auth.uid()));
create policy "tickets admin insert" on public.tickets
  for insert with check (is_admin(auth.uid()));
create policy "tickets staff update" on public.tickets
  for update using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- checkins policies
create policy "checkins staff insert" on public.checkins
  for insert with check (is_staff(auth.uid()));
create policy "checkins staff read" on public.checkins
  for select using (is_staff(auth.uid()));

-- seed/admin helper: set a user's role manually
-- after user signs up, run:
-- update public.profiles set role = 'admin' where id = '<auth_user_id>';
