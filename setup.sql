-- NEO ARCH — schéma initial Supabase
-- À exécuter dans Supabase > SQL Editor > New query.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text not null,
  class_name text,
  order_name text,
  family_name text,
  conservation_status text,
  habitat text,
  distribution text,
  diet text,
  description text,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.species enable row level security;

-- Un utilisateur connecté ne peut lire que sa propre ligne admin.
create policy "Admins can read own membership"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

-- Le catalogue public ne montre que les fiches publiées.
create policy "Public can read published species"
on public.species for select to anon, authenticated
using (published = true);

-- Les administrateurs identifiés peuvent tout gérer.
create policy "Admins can manage species"
on public.species for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

grant select on public.admin_users to authenticated;
grant select on public.species to anon, authenticated;
grant insert, update, delete on public.species to authenticated;

-- Crée un bucket public pour les photos destinées au catalogue.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animal-photos', 'animal-photos', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Public can view animal photos"
on storage.objects for select
using (bucket_id = 'animal-photos');

create policy "Admins can upload animal photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'animal-photos'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "Admins can update animal photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'animal-photos'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'animal-photos'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "Admins can delete animal photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'animal-photos'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- IMPORTANT : après avoir créé ton compte dans Authentication > Users,
-- récupère son UUID, puis exécute cette requête en remplaçant l'UUID :
-- insert into public.admin_users (user_id) values ('UUID-DE-TON-COMPTE');
