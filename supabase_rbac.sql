-- Create user_roles table
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text check (role in ('owner', 'staff')) not null,
  unique(user_id)
);

-- Enable RLS for user_roles
alter table user_roles enable row level security;

-- Policies for user_roles
-- Only 'owner' can insert/update roles (Bootstrap problem: you need to manually insert the first owner in DB dashboard or SQL editor)
create policy "Owners can manage all roles"
  on user_roles
  for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Everyone can read their own role
create policy "Users can read their own role"
  on user_roles
  for select
  using (user_id = auth.uid());


-- Create timesheets table
create table timesheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  clock_in timestamptz default now() not null,
  clock_out timestamptz
);

-- Enable RLS for timesheets
alter table timesheets enable row level security;

-- Policies for timesheets
-- Users can insert their own clock_in
create policy "Users can clock in"
  on timesheets
  for insert
  with check (user_id = auth.uid());

-- Users can update (clock out) their own timesheet
create policy "Users can clock out"
  on timesheets
  for update
  using (user_id = auth.uid());

-- Owners can read all timesheets
create policy "Owners can view all timesheets"
  on timesheets
  for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Staff can see their own timesheets
create policy "Staff can view their own timesheets"
  on timesheets
  for select
  using (user_id = auth.uid());
