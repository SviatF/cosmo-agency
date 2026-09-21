create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'review' check (status in ('draft','submitted','review','approved','rejected','needs_changes')),
  locale text not null default 'ru' check (locale in ('ru','ua','en')),
  full_name text not null,
  date_of_birth date not null,
  phone text not null,
  telegram text,
  email text not null,
  country text,
  city text,
  experience text,
  schedule text,
  languages text,
  document_type text not null default 'passport',
  document_front_path text not null,
  document_back_path text not null,
  consent_at timestamptz not null default now(),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_created_at_idx on public.applications(created_at desc);

alter table public.applications enable row level security;

-- No public policies: the application is accessed only through the Cloudflare Worker
-- using the server-side service-role secret. This keeps passport metadata and review
-- state private from the browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is private and intentionally has no anonymous/authenticated object policies.
-- Files are uploaded/read only by the server-side service-role integration.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();
