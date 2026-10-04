-- AdventureCarz initial schema
--
-- Storage rules:
--   * Pages, site settings, cars, services and happy customers keep only the current version.
--     Saving replaces the row in place; no history is stored.
--   * Blog posts, testimonials and leads are tracked: every previous version (including the
--     last version of a deleted row) is copied into content_revisions by a trigger, so history
--     is kept even if a caller forgets.
--   * Leads are a permanent record of every enquiry form submission. Their status and notes
--     can be updated (each change is tracked) but a lead can never be deleted.
--
-- Access: row-level security is on for every table with no policies, so the publishable key
-- can read or write nothing. Only the Express backend, using the secret key, has access.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Slugs are lowercase words joined by single hyphens, for example: toyota-innova-crysta.
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) <= 80);

create domain public.publish_status as text
  check (value in ('draft', 'published'));

-- History for tracked tables (blog_posts, testimonials, leads). Each row is one earlier
-- version of a record, so any version can be viewed or restored.
create table public.content_revisions (
  id bigint generated always as identity primary key,
  entity text not null check (entity in ('blog_posts', 'testimonials', 'leads')),
  row_id uuid not null,
  revision integer not null,
  -- 'update' = the version before an edit; 'delete' = the final version of a deleted row.
  action text not null check (action in ('update', 'delete')),
  snapshot jsonb not null,
  -- Who saved that version, and when it was saved.
  saved_by uuid references auth.users (id) on delete set null,
  saved_at timestamptz not null,
  unique (entity, row_id, revision)
);

create index content_revisions_row_idx on public.content_revisions (entity, row_id, revision desc);

-- Attached to every tracked table. Tracked tables have id, revision, updated_at and updated_by columns.
-- On update: copies the outgoing version and bumps revision, unless nothing but the timestamps changed.
-- On delete: copies the final version so the record's history survives it.
create or replace function public.keep_revision()
returns trigger
language plpgsql
as $$
declare
  ignored text[] := array['updated_at', 'updated_by', 'revision'];
begin
  if tg_op = 'DELETE' then
    insert into public.content_revisions (entity, row_id, revision, action, snapshot, saved_by, saved_at)
    values (tg_table_name, old.id, old.revision, 'delete', to_jsonb(old), old.updated_by, old.updated_at);
    return old;
  end if;

  if (to_jsonb(new) - ignored) is distinct from (to_jsonb(old) - ignored) then
    insert into public.content_revisions (entity, row_id, revision, action, snapshot, saved_by, saved_at)
    values (tg_table_name, old.id, old.revision, 'update', to_jsonb(old), old.updated_by, old.updated_at);
    new.revision := old.revision + 1;
  else
    new.revision := old.revision;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Pages and site settings: one row per page, replaced on every save
-- ---------------------------------------------------------------------------

create table public.pages (
  key text primary key check (key in ('home', 'about-us', 'contact', 'blogs', 'cars', 'site-settings')),
  -- Every heading, paragraph, image and SEO field of the page, for example
  -- {"heading": "Explore Assam.", "description": "...", "seoTitle": "..."}.
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger pages_set_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Fleet: current version only
-- ---------------------------------------------------------------------------

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  name text not null check (length(name) between 1 and 120),
  categories text[] not null default '{}',
  badge text,
  featured boolean not null default false,
  description text,
  image text,
  image_alt text,
  image_position text,
  fuel text,
  transmission text,
  seats text,
  price_per_day integer not null check (price_per_day >= 0),
  seo_title text,
  seo_description text,
  status public.publish_status not null default 'draft',
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index cars_listing_idx on public.cars (status, archived, position);

create trigger cars_set_updated_at before update on public.cars
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Blog posts: tracked (current version here, every previous version in content_revisions)
-- ---------------------------------------------------------------------------

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  title text not null check (length(title) between 1 and 200),
  category text not null,
  published_on date,
  excerpt text,
  image text,
  image_alt text,
  -- Plain text. Paragraphs are separated by a blank line; a short first line becomes a heading.
  body text not null,
  seo_title text,
  seo_description text,
  status public.publish_status not null default 'draft',
  archived boolean not null default false,
  -- Increases by one on every content change; the old version is copied to content_revisions.
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index blog_posts_listing_idx on public.blog_posts (status, archived, published_on desc);

create trigger blog_posts_keep_revision before update or delete on public.blog_posts
  for each row execute function public.keep_revision();

-- ---------------------------------------------------------------------------
-- Services and happy customers: current version only. Testimonials: tracked.
-- ---------------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  label text,
  description text not null,
  image text,
  image_alt text,
  feature_badge text,
  feature_title text,
  feature_description text,
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  trip_or_role text,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  image text,
  image_alt text,
  -- When and how the customer agreed to be quoted.
  permission_notes text,
  position integer not null default 0,
  archived boolean not null default false,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.happy_customers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  destination text,
  image text,
  image_alt text,
  caption text,
  permission_notes text,
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger testimonials_keep_revision before update or delete on public.testimonials
  for each row execute function public.keep_revision();
create trigger happy_customers_set_updated_at before update on public.happy_customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Redirects: renaming a car or blog slug keeps the old URL working with a 301
-- ---------------------------------------------------------------------------

create table public.redirects (
  from_path text primary key,
  to_path text not null,
  created_at timestamptz not null default now(),
  check (from_path <> to_path)
);

create or replace function public.record_slug_redirect()
returns trigger
language plpgsql
as $$
declare
  base text := tg_argv[0];
  old_path text := base || '/' || old.slug;
  new_path text := base || '/' || new.slug;
begin
  if new.slug is distinct from old.slug then
    -- The new address is live again, so it must not redirect anywhere.
    delete from public.redirects where from_path = new_path;
    -- Point earlier redirects straight at the new address instead of chaining them.
    update public.redirects set to_path = new_path where to_path = old_path;
    insert into public.redirects (from_path, to_path) values (old_path, new_path)
      on conflict (from_path) do update set to_path = excluded.to_path;
  end if;
  return new;
end;
$$;

create trigger cars_record_slug_redirect after update of slug on public.cars
  for each row execute function public.record_slug_redirect('/cars');
create trigger blog_posts_record_slug_redirect after update of slug on public.blog_posts
  for each row execute function public.record_slug_redirect('/blogs');

-- ---------------------------------------------------------------------------
-- Leads: every enquiry form submission is kept permanently, and every change is tracked
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  phone text not null check (length(phone) between 6 and 20),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text check (message is null or length(message) <= 2000),
  -- Which car they asked about. car_name is copied in so the lead still makes sense
  -- if the car is later renamed or removed.
  car_id uuid references public.cars (id) on delete set null,
  car_name text,
  pickup_date date,
  return_date date,
  check (return_date is null or pickup_date is null or return_date >= pickup_date),
  -- Where the enquiry came from, for measuring which pages and campaigns bring customers.
  source_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  -- The visitor agreed to be contacted (needed under India's DPDP Act).
  consent boolean not null default false,
  -- Any form field without its own column (for example a field added to the form later),
  -- so no submitted input is ever lost.
  extra jsonb not null default '{}'::jsonb check (jsonb_typeof(extra) = 'object'),
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed', 'spam')),
  admin_notes text,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index leads_created_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status, created_at desc);

-- Status and note changes are kept, so you can see when a lead was contacted or booked, and by whom.
create trigger leads_keep_revision before update on public.leads
  for each row execute function public.keep_revision();

-- Leads are history: mark unwanted ones as 'spam' or 'closed' instead of deleting.
-- To honour a legal deletion request, a database owner can run:
--   alter table public.leads disable trigger leads_prevent_delete; delete ...; alter table ... enable trigger ...;
create or replace function public.leads_prevent_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Leads are permanent records and cannot be deleted. Set status to spam or closed instead.';
end;
$$;

create trigger leads_prevent_delete before delete on public.leads
  for each row execute function public.leads_prevent_delete();

-- ---------------------------------------------------------------------------
-- Row-level security: on everywhere, no policies. Only the secret key (Express) has access.
-- ---------------------------------------------------------------------------

alter table public.pages enable row level security;
alter table public.cars enable row level security;
alter table public.blog_posts enable row level security;
alter table public.content_revisions enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.happy_customers enable row level security;
alter table public.redirects enable row level security;
alter table public.leads enable row level security;

-- ---------------------------------------------------------------------------
-- Image storage: public to read (images appear on the website), uploads only via Express
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
