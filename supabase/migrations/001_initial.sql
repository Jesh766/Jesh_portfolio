-- Jayshil Portfolio — initial schema

create extension if not exists "pgcrypto";

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page_path text,
  section_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.resume_downloads (
  id uuid primary key default gen_random_uuid(),
  source text default 'hero',
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_type on public.analytics_events (event_type);
create index if not exists idx_analytics_events_created on public.analytics_events (created_at desc);
create index if not exists idx_contact_created on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.resume_downloads enable row level security;
