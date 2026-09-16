create table if not exists public.portfolio_content (
  id text primary key default 'default',
  content jsonb not null default '{}'::jsonb,
  draft_content jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content add column if not exists draft_content jsonb;

alter table public.portfolio_content enable row level security;

insert into public.portfolio_content (id, content)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.analytics_events
  add column if not exists session_id text,
  add column if not exists duration_ms integer;

create index if not exists idx_analytics_events_session on public.analytics_events (session_id);
