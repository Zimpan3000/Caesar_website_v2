begin;

create table public.caesar_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'),
  name text not null check (length(name) between 1 and 100),
  role text not null default 'member' check (role in ('admin', 'member')),
  active boolean not null default true,
  session_epoch uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create table public.caesar_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references public.caesar_profiles(id) on delete cascade,
  session_epoch uuid not null,
  expires_at timestamptz not null
);
create index caesar_sessions_expiry_idx on public.caesar_sessions(expires_at);
create index caesar_sessions_user_idx on public.caesar_sessions(user_id);

-- A versioned JSONB document preserves the existing workspace model. Writes use
-- a revision predicate so records and their activity commit atomically.
create table public.caesar_workspace (
  id integer primary key check (id = 1),
  revision integer not null default 0 check (revision >= 0),
  data jsonb not null check (jsonb_typeof(data) = 'object')
);
insert into public.caesar_workspace (id, data) values
  (1, '{"teams":[],"projects":[],"goals":[],"updates":[],"entries":[],"activity":[]}');

-- Only the Express backend's secret key may read or modify these tables.
-- Neither public keys nor an ordinary Supabase Auth JWT grant table access.
alter table public.caesar_profiles enable row level security;
alter table public.caesar_sessions enable row level security;
alter table public.caesar_workspace enable row level security;
revoke all on public.caesar_profiles, public.caesar_sessions, public.caesar_workspace from anon, authenticated;
grant select, insert, update, delete on public.caesar_profiles, public.caesar_sessions, public.caesar_workspace to service_role;

-- app_metadata is admin-controlled. Public signup and user_metadata cannot
-- provision workspace access or grant an administrator role.
create function public.caesar_provision_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_app_meta_data ->> 'caesar_workspace' = 'true' then
    insert into public.caesar_profiles (id, username, name, role)
    values (new.id, new.raw_app_meta_data ->> 'caesar_username',
      new.raw_app_meta_data ->> 'caesar_name',
      coalesce(new.raw_app_meta_data ->> 'caesar_role', 'member'));
  end if;
  return new;
end;
$$;
revoke all on function public.caesar_provision_profile() from public, anon, authenticated;
create trigger caesar_auth_user_created after insert on auth.users
for each row execute function public.caesar_provision_profile();

create function public.caesar_invalidate_sessions() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.session_epoch := gen_random_uuid();
  return new;
end;
$$;
revoke all on function public.caesar_invalidate_sessions() from public, anon, authenticated;
create trigger caesar_profile_changed before update on public.caesar_profiles
for each row execute function public.caesar_invalidate_sessions();

commit;
