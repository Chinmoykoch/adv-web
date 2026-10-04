-- Per-article and per-car search controls, edited in the admin panel.
-- Pages and site settings keep the same fields inside their `content` JSON, so they need no change.
--
--   noindex          true = the page stays on the website but asks Google not to list it,
--                    and it is left out of the sitemap.
--   canonical_url    The main address of this content, when it is published in more than one
--                    place: a site path (/blogs/other-post) or a full https:// link. Empty = its own URL.
--   share_image      The picture shown when the page is shared on WhatsApp or social media.
--   share_image_alt  Empty share_image = the main image is used, then the site's default share image.

alter table public.blog_posts
  add column noindex boolean not null default false,
  add column canonical_url text,
  add column share_image text,
  add column share_image_alt text;

alter table public.cars
  add column noindex boolean not null default false,
  add column canonical_url text,
  add column share_image text,
  add column share_image_alt text;
