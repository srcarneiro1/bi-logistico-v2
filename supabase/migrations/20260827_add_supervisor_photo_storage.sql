create table if not exists public.supervisor_fotos (
  supervisor_id text primary key,
  foto_path text not null,
  content_type text not null check (content_type in ('image/jpeg','image/png','image/webp')),
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

alter table public.supervisor_fotos enable row level security;
revoke all on table public.supervisor_fotos from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'supervisor-fotos',
  'supervisor-fotos',
  false,
  2097152,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.supervisor_fotos is
  'Override interno de foto por SupervisorID. A HUB permanece como fonte cadastral e FotoURL externo funciona apenas como fallback.';
