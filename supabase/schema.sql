-- Create Bookings Table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  phone_number text not null,
  booking_date date not null,
  booking_time time without time zone not null,
  party_size integer not null default 2,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  notes text
);

-- Create Menu Items Table
create table public.menu_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric not null,
  category text,
  image_url text,
  is_available boolean default true
);

-- Create Availability Table
create table public.availability (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  open_time time without time zone not null,
  close_time time without time zone not null,
  is_closed boolean default false,
  unique (day_of_week)
);

-- Enable Row Level Security (RLS)
alter table public.bookings enable row level security;
alter table public.menu_items enable row level security;
alter table public.availability enable row level security;

-- Policies (Simple public access for demo, ideally stricter for production)
-- Allow anyone to create a booking
create policy "Enable insert for everyone" on public.bookings for insert with check (true);
-- Allow reading bookings only technically by admin or specific logic (for now public for simplicity or authenticated)
-- Ideally: create policy "Enable read for authenticated users only" on public.bookings for select using (auth.role() = 'authenticated');

-- Public read access for menu and availability
create policy "Allow public read access" on public.menu_items for select using (true);
create policy "Allow public read access" on public.availability for select using (true);

-- Insert Default Availability (Mon-Sun: 12:00 - 22:00)
insert into public.availability (day_of_week, open_time, close_time) values
(0, '12:00', '22:00'),
(1, '12:00', '22:00'),
(2, '12:00', '22:00'),
(3, '12:00', '22:00'),
(4, '12:00', '23:00'),
(5, '12:00', '23:00'),
(6, '12:00', '22:00');

-- Insert Sample Menu Items
insert into public.menu_items (name, description, price, category, is_available) values
('Margherita Pizza', 'Tomato sauce, mozzarella, and basil.', 12.00, 'Main', true),
('Tiramisu', 'Classic Italian dessert with coffee and mascarpone.', 8.00, 'Dessert', true);
