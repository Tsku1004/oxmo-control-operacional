create table if not exists public.oxmo_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.oxmo_state enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.oxmo_state to anon, authenticated;

drop policy if exists "oxmo_state_read" on public.oxmo_state;
drop policy if exists "oxmo_state_insert" on public.oxmo_state;
drop policy if exists "oxmo_state_update" on public.oxmo_state;
drop policy if exists "oxmo_state_delete" on public.oxmo_state;

create policy "oxmo_state_read"
on public.oxmo_state for select
using (true);

create policy "oxmo_state_insert"
on public.oxmo_state for insert
with check (true);

create policy "oxmo_state_update"
on public.oxmo_state for update
using (true)
with check (true);

create policy "oxmo_state_delete"
on public.oxmo_state for delete
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'oxmo_state'
  ) then
    alter publication supabase_realtime add table public.oxmo_state;
  end if;
end $$;
