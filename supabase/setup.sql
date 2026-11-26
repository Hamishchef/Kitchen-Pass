-- Kitchen Pass database setup. Paste into Supabase > SQL Editor > New query, change the
-- email on the last line to your own, and press Run. Safe to run more than once.

create table if not exists public.members (
  email      text primary key check (email = lower(email)),
  role       text not null default 'chef' check (role in ('chef', 'admin')),
  added_at   timestamptz not null default now()
);

create table if not exists public.items (
  id          text primary key,              -- "<collection>/<doc id>"
  collection  text not null,                 -- recipes, menus, contacts, orders, residences, people
  data        jsonb not null default '{}'::jsonb,
  deleted     boolean not null default false, -- soft delete so offline phones learn about it
  updated_at  timestamptz not null default now(),
  updated_by  text
);
create index if not exists items_updated_at on public.items (updated_at);

-- Who is signed in, and are they on the team?
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.members where email = lower(auth.jwt() ->> 'email')
$$;
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() is not null
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() = 'admin', false)
$$;

-- The server stamps every change, so sync order never depends on a phone's clock.
create or replace function public.items_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  new.updated_by := auth.jwt() ->> 'email';
  return new;
end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before insert or update on public.items
  for each row execute function public.items_touch();

alter table public.items   enable row level security;
alter table public.members enable row level security;

drop policy if exists "team reads"   on public.items;
drop policy if exists "team adds"    on public.items;
drop policy if exists "team edits"   on public.items;
create policy "team reads" on public.items for select to authenticated using (public.is_member());
create policy "team adds"  on public.items for insert to authenticated with check (public.is_member());
create policy "team edits" on public.items for update to authenticated using (public.is_member()) with check (public.is_member());
-- No delete policy: items are soft-deleted, and nobody can wipe rows from a phone.

drop policy if exists "team sees team"      on public.members;
drop policy if exists "admins add"          on public.members;
drop policy if exists "admins change"       on public.members;
drop policy if exists "admins remove"       on public.members;
create policy "team sees team" on public.members for select to authenticated using (public.is_member());
create policy "admins add"     on public.members for insert to authenticated with check (public.is_admin());
create policy "admins change"  on public.members for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins remove"  on public.members for delete to authenticated using (public.is_admin());

grant execute on function public.my_role() to authenticated;

-- You, as the first admin. Change this email to the one you will sign in with.
insert into public.members (email, role) values (lower('you@example.com'), 'admin')
  on conflict (email) do update set role = 'admin';

-- ---------------------------------------------------------------------------
-- Invite codes (no email needed). Requires Authentication > Email > "Confirm email" OFF.
alter table public.members add column if not exists invite_code text, add column if not exists claimed_by uuid;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.members
   where email = lower(auth.jwt() ->> 'email') and claimed_by = auth.uid()
$$;

create or replace function public.new_code() returns text
language sql volatile set search_path = public as $$
  select upper(substr(translate(encode(gen_random_bytes(8), 'base64'), '+/=0O1Il', ''), 1, 6))
$$;

create or replace function public.claim_invite(code text) returns text
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  update public.members set claimed_by = auth.uid(), invite_code = null
   where email = lower(auth.jwt() ->> 'email')
     and invite_code is not null and invite_code = upper(trim(code))
     and claimed_by is null
  returning role into r;
  return r;
end $$;

create or replace function public.invite_member(p_email text, p_role text default 'chef') returns text
language plpgsql security definer set search_path = public, auth as $$
declare c text := public.new_code(); e text := lower(trim(p_email));
begin
  if not public.is_admin() then raise exception 'Only an admin can invite'; end if;
  if p_role not in ('chef','admin') then raise exception 'Bad role'; end if;
  if e = lower(auth.jwt() ->> 'email') then raise exception 'You cannot reset your own account'; end if;
  delete from auth.users where lower(email) = e;
  insert into public.members (email, role, invite_code, claimed_by) values (e, p_role, c, null)
    on conflict (email) do update set role = excluded.role, invite_code = c, claimed_by = null;
  return c;
end $$;

create or replace function public.remove_member(p_email text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare e text := lower(trim(p_email));
begin
  if not public.is_admin() then raise exception 'Only an admin can remove'; end if;
  if e = lower(auth.jwt() ->> 'email') then raise exception 'You cannot remove yourself'; end if;
  delete from auth.users where lower(email) = e;
  delete from public.members where email = e;
end $$;

alter policy "team sees team" on public.members using (public.is_admin());

-- Give the first admin an invite code to claim their account.
update public.members set invite_code = public.new_code(), claimed_by = null where role = 'admin' and claimed_by is null;
