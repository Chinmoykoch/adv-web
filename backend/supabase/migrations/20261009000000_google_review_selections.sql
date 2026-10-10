-- Keep only the owner's selection of resource IDs, not Google review content.
-- Text, ratings and reviewer details are fetched from Google and never enter revision history.
create table public.google_review_selections (
  location_name text primary key check (location_name ~ '^accounts/[0-9]+/locations/[0-9]+$'),
  review_ids text[] not null default '{}' check (cardinality(review_ids) <= 12),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger google_review_selections_updated_at before update on public.google_review_selections
  for each row execute function public.set_updated_at();

alter table public.google_review_selections enable row level security;
-- No browser policies: reads/writes go through the authenticated Express admin routes.
