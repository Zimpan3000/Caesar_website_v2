begin;

-- Supabase Auth inserts the user before updating custom app_metadata. Handle
-- both events; never overwrite an existing profile's role or access status.
create or replace function public.caesar_provision_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_app_meta_data ->> 'caesar_workspace' = 'true' then
    insert into public.caesar_profiles (id, username, name, role)
    values (new.id, new.raw_app_meta_data ->> 'caesar_username',
      new.raw_app_meta_data ->> 'caesar_name',
      coalesce(new.raw_app_meta_data ->> 'caesar_role', 'member'))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.caesar_provision_profile() from public, anon, authenticated;

drop trigger if exists caesar_auth_user_created on auth.users;
create trigger caesar_auth_user_created
after insert or update of raw_app_meta_data on auth.users
for each row execute function public.caesar_provision_profile();

-- Recover accounts created before this fix, using only admin-controlled metadata.
insert into public.caesar_profiles (id, username, name, role)
select id, raw_app_meta_data ->> 'caesar_username',
  raw_app_meta_data ->> 'caesar_name',
  coalesce(raw_app_meta_data ->> 'caesar_role', 'member')
from auth.users
where raw_app_meta_data ->> 'caesar_workspace' = 'true'
on conflict (id) do nothing;

commit;
