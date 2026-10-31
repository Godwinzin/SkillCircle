-- The bucket, with a size limit and allowed file types enforced by the server
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Members can upload, see and delete files only inside their own folder
create policy "Members can upload to their own avatar folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Members can see files in their own avatar folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Members can delete files in their own avatar folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Never trust a URL field: avatar_url must point into your own folder in this bucket
alter table public.profiles
  add constraint avatar_url_own_folder check (
    avatar_url is null
    or avatar_url like (
      'https://afwvmzwybdccnrwzvwdo.supabase.co/storage/v1/object/public/avatars/'
      || id::text || '/%'
    )
  );