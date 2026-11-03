-- Schéma SQL Supabase pour la migration depuis LocalStorage
-- Exécutez ce script dans le SQL Editor de votre projet Supabase

create table if not exists public.alternance_applications (
  id text primary key,
  company text not null,
  sector text not null,
  role text not null,
  city text not null,
  status text not null check (status in ('A_POSTULER', 'ENVOYEE', 'RELANCEE', 'ENTRETIEN', 'REFUSEE', 'OFFRE', 'ACCEPTEE')),
  priority smallint not null default 3 check (priority in (1, 2, 3)),
  source text not null,
  channel_detail text,
  job_url text,
  contract_type text not null default 'Apprentissage',
  rhythm text,
  applied_date date not null,
  follow_up_date date,
  interview_date date,
  contact jsonb not null default '{}'::jsonb,
  documents jsonb not null default '{}'::jsonb,
  notes text not null default '',
  email_bounce boolean not null default false,
  action_required text,
  timeline jsonb not null default '[]'::jsonb,
  created_at date not null default current_date,
  updated_at date not null default current_date
);

create index if not exists idx_alternance_applications_status on public.alternance_applications(status);
create index if not exists idx_alternance_applications_applied_date on public.alternance_applications(applied_date desc);
