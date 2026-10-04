-- Cars no longer have a price: rates are shared when a customer enquires.
-- This permanently deletes the stored per-day prices. Run it together with the matching code
-- update (backend restart): the old code still expects the column.

alter table public.cars drop column price_per_day;
