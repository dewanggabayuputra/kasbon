-- 1. Enum
create type public.debt_type as enum (
  'owed_to_me',
  'i_owe'
);

-- 2. Table
create table public.debts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  type public.debt_type not null,

  counterpart_name text not null,

  amount bigint not null
    check (amount > 0),

  note text
    check (note is null or char_length(note) <= 200),

  due_date date,

  settled_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- 3. Index
create index debts_user_id_idx
on public.debts(user_id);

create index debts_user_id_settled_at_idx
on public.debts(user_id, settled_at);

create index debts_user_id_type_idx
on public.debts(user_id, type);


-- 4. Enable RLS
alter table public.debts enable row level security;


-- 5. RLS policies
create policy "Users can view their own debts"
on public.debts
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Users can create their own debts"
on public.debts
for insert
to authenticated
with check (
  user_id = auth.uid()
);

create policy "Users can update their own debts"
on public.debts
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Users can delete their own debts"
on public.debts
for delete
to authenticated
using (
  user_id = auth.uid()
);

