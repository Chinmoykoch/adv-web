-- Which cars appear in the home page's "Curated Garage" section (at most 4, enforced by the API).
-- If fewer than 4 are chosen, the website fills the gaps with the next cars in display order.

alter table public.cars add column show_on_home boolean not null default false;

-- Start with the 4 cars the home page shows today: the first published ones in display order.
update public.cars set show_on_home = true
where id in (
  select id from public.cars
  where status = 'published' and archived = false
  order by position, created_at
  limit 4
);
