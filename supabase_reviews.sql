-- Drop table if exists to ensure clean slate (optional, be careful in prod)
-- drop table if exists public.reviews;

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  customer_name text
);

-- Row Level Security
alter table public.reviews enable row level security;

-- Policy: Allow public to insert (anyone can leave a review)
create policy "Allow public insert to reviews"
on public.reviews
for insert
to public
with check (true);

-- Policy: Allow authenticated (admin) to view reviews
create policy "Allow authenticated read access"
on public.reviews
for select
to authenticated
using (true);
