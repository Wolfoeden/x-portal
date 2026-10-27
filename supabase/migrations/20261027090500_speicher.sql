-- Dateien: Fotos und Lebensläufe, beide privat. Pfad immer <Konto-ID>/<Datei>.
-- Fotos für die Website liefert der Server aus, und nur, wenn das Profil in showcase_profiles steht.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('cvs', 'cvs', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Dateien: eigene verwalten" on storage.objects
  for all to authenticated
  using (bucket_id in ('avatars', 'cvs') and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id in ('avatars', 'cvs') and (storage.foldername(name))[1] = (select auth.uid())::text);
