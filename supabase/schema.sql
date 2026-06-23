drop table if exists public.shopping_lists cascade;

create table public.shopping_lists (
  id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  themes jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone not null default now()
);

alter table public.shopping_lists enable row level security;

create policy "egen liste - laes"
  on public.shopping_lists
  for select
  to authenticated
  using (auth.uid() = id);

create policy "egen liste - opret"
  on public.shopping_lists
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "egen liste - opdater"
  on public.shopping_lists
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
