-- Create the storage bucket for menu images
insert into storage.buckets (id, name, public)
values ('menu_images', 'menu_images', true)
on conflict (id) do nothing;

-- Policy: Allow public read access to all files in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'menu_images' );

-- Policy: Allow authenticated users (Admin) to insert files
create policy "Authenticated Insert"
  on storage.objects for insert
  with check ( bucket_id = 'menu_images' and auth.role() = 'authenticated' );

-- Policy: Allow authenticated users (Admin) to update files
create policy "Authenticated Update"
  on storage.objects for update
  with check ( bucket_id = 'menu_images' and auth.role() = 'authenticated' );

-- Policy: Allow authenticated users (Admin) to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'menu_images' and auth.role() = 'authenticated' );
