-- ─── Migration 0002 — site content + reviews + festival theme seeds ────────
--
-- Run order: applies cleanly on top of 0001_init.sql. Idempotent (uses
-- `if not exists` and `on conflict do nothing` everywhere).
--
-- What this adds:
--   1. site_content    — admin-editable copy for hero, signature, editorial,
--                         footer, etc. One row per section key.
--   2. reviews         — customer reviews on products. Verified-purchase via
--                         FK to orders. Status workflow for moderation.
--   3. theme_presets   — seeds 8 Indian festival presets (default already in 0001).
--   4. helpful_votes   — per-review helpful upvotes (one per customer per review).
--   5. products.unit_mode — nullable column to support weight vs. piece pricing.

-- ─── 0. unit_mode column on products ──────────────────────────────────────
alter table public.products
  add column if not exists unit_mode text
  check (unit_mode is null or unit_mode in ('weight', 'quantity'));

-- ─── 1. site_content (admin-editable copy) ────────────────────────────────
create table if not exists public.site_content (
  key         text primary key,        -- 'hero', 'signature_moment', 'editorial_band', 'footer', 'about_intro', etc.
  data        jsonb not null,          -- shape varies per key
  updated_at  timestamptz default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

create or replace function public.touch_site_content()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_site_content();

alter table public.site_content enable row level security;

drop policy if exists "anyone reads site content" on public.site_content;
create policy "anyone reads site content" on public.site_content for select
  using (true);

drop policy if exists "admin writes site content" on public.site_content;
create policy "admin writes site content" on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed defaults so storefront has something to render before admin edits.
insert into public.site_content (key, data) values
  ('hero', jsonb_build_object(
     'eyebrowIndic', 'ఖమ్మం',
     'eyebrowEn', 'Khammam · Telangana',
     'headline', 'The sweetness of Telangana, slow-cooked in Khammam.',
     'body', 'Qubani ka Meetha, Badam ki Jali, Double ka Meetha — plus a full line of sweets, namkeens, and gift hampers. Hand-made, preservative-free, delivered across India.',
     'primaryCtaLabel', 'Shop Hyderabadi specials',
     'primaryCtaHref', '/category/hyderabadi-specials',
     'secondaryCtaLabel', 'Corporate gifting',
     'secondaryCtaHref', '/corporate'
   )),
  ('signature_moment', jsonb_build_object(
     'eyebrow', 'The signature',
     'headline', 'Qubani ka Meetha, the slow way.',
     'body', 'Four hours over a low flame. Apricots reduced in their own syrup. Almonds folded in last so the crunch holds. Served chilled, the way Hyderabad has always preferred.',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/anjjeer_katli-removebg-preview.png'
   )),
  ('editorial_band_heading', jsonb_build_object(
     'eyebrow', 'Inside the kitchen',
     'headline', 'Five small acts, every morning.'
   )),
  ('footer', jsonb_build_object(
     'tagline', 'Hand-made Telangana sweets from our Khammam kitchen.',
     'fssaiLine', 'FSSAI · Telangana — pending. GSTIN — Telangana series, pending.',
     'phone', '+91 93988 59978',
     'email', 'orders@ravisweets.com'
   )),
  ('home_trust', jsonb_build_object(
     'cards', jsonb_build_array(
       jsonb_build_object('title', 'No preservatives', 'body', 'Small-batch, slow-cooked, made fresh every day in our FSSAI-certified kitchen.'),
       jsonb_build_object('title', 'Delivered across India', 'body', 'Temperature-controlled dispatch with chilled-safe packaging.'),
       jsonb_build_object('title', 'Telangana heritage', 'body', 'Recipes from the Deccan sweet tradition, made in our Khammam kitchen.')
     )
   ))
on conflict (key) do nothing;

-- ─── 2. reviews ──────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  product_id      text not null references public.products(id) on delete cascade,
  customer_id     uuid not null references auth.users(id) on delete cascade,
  order_id        uuid references public.orders(id) on delete set null,   -- non-null = verified purchase
  rating          smallint not null check (rating between 1 and 5),
  title           text check (title is null or char_length(title) <= 80),
  body            text not null check (char_length(body) between 20 and 1500),
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected', 'flagged')),
  helpful_count   int not null default 0,
  brand_reply     text,
  brand_replied_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (product_id, customer_id)
);

create index if not exists reviews_product_status_idx
  on public.reviews (product_id, status, created_at desc);

create or replace function public.touch_reviews()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_reviews();

alter table public.reviews enable row level security;

drop policy if exists "anyone reads approved reviews" on public.reviews;
create policy "anyone reads approved reviews" on public.reviews for select
  using (status = 'approved' or auth.uid() = customer_id or public.is_admin());

drop policy if exists "customer inserts own review" on public.reviews;
create policy "customer inserts own review" on public.reviews for insert
  with check (auth.uid() = customer_id);

drop policy if exists "admin updates reviews" on public.reviews;
create policy "admin updates reviews" on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes reviews" on public.reviews;
create policy "admin deletes reviews" on public.reviews for delete
  using (public.is_admin());

-- ─── 3. helpful_votes (one per customer per review) ──────────────────────
create table if not exists public.review_helpful_votes (
  review_id   uuid not null references public.reviews(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  voted_at    timestamptz default now(),
  primary key (review_id, customer_id)
);

alter table public.review_helpful_votes enable row level security;

drop policy if exists "anyone reads helpful votes" on public.review_helpful_votes;
create policy "anyone reads helpful votes" on public.review_helpful_votes for select
  using (true);

drop policy if exists "customer inserts own helpful vote" on public.review_helpful_votes;
create policy "customer inserts own helpful vote" on public.review_helpful_votes for insert
  with check (auth.uid() = customer_id);

drop policy if exists "customer deletes own helpful vote" on public.review_helpful_votes;
create policy "customer deletes own helpful vote" on public.review_helpful_votes for delete
  using (auth.uid() = customer_id);

-- Trigger to keep reviews.helpful_count in sync.
create or replace function public.sync_review_helpful_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
  elsif (tg_op = 'DELETE') then
    update public.reviews set helpful_count = greatest(0, helpful_count - 1) where id = old.review_id;
  end if;
  return null;
end;
$$;

drop trigger if exists review_helpful_votes_count on public.review_helpful_votes;
create trigger review_helpful_votes_count
  after insert or delete on public.review_helpful_votes
  for each row execute function public.sync_review_helpful_count();

-- ─── 4. festival theme preset seeds ──────────────────────────────────────
-- 8 Indian festivals + the default. Activating any of these from
-- /admin/themes flips the storefront within ~5 seconds via Realtime.

insert into public.theme_presets (id, name, active, palette, hero, banner_text) values
  ('diwali',
   'Diwali — saffron & brass',
   false,
   '{"base":"#fff4e3","accent":"#c0592b","glow":"#f29f5a","ink":"#3a1e0c","grainOpacity":0.06}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Diwali 2026 · Festival of light',
     'headline', 'Light up the table.',
     'body', 'Premium hampers, festival specials, and a free brass diya with every Grande box.',
     'ctaLabel', 'Shop Diwali hampers',
     'ctaHref', '/category/gift-hampers',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/dry_fruit_chikki-removebg-preview.png'
   ),
   'Free Diwali shipping above ₹1499'),
  ('eid',
   'Eid — date amber',
   false,
   '{"base":"#fff4e3","accent":"#a56a0f","glow":"#e9ad4a","ink":"#2a1a04","grainOpacity":0.06}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Eid al-Fitr',
     'headline', 'A platter worth the long day.',
     'body', 'Sheer Khurma, Double ka Meetha, Khubani — the Hyderabadi Eid table, in one box.',
     'ctaLabel', 'Shop the Eid box',
     'ctaHref', '/product/eid-signature-box',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/badam_pista_kalakand-removebg-preview.png'
   ),
   null),
  ('rakhi',
   'Raksha Bandhan — rose silk',
   false,
   '{"base":"#fdf3df","accent":"#c0592b","glow":"#f29f5a","ink":"#3a1e0c","grainOpacity":0.05}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Raksha Bandhan',
     'headline', 'For the ones who remember the small promises.',
     'body', 'A hamper tied with a thread — the traditional signifier, done properly. Compact boxes for courier and weighted boxes for hand-delivery.',
     'ctaLabel', 'Shop Rakhi hampers',
     'ctaHref', '/festivals/raksha-bandhan',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/kaju_katli-removebg-preview.png'
   ),
   'Free rakhi thread with every box'),
  ('holi',
   'Holi — playful pink + saffron',
   false,
   '{"base":"#fdf3df","accent":"#c87a8a","glow":"#f2a365","ink":"#3a1e0c","grainOpacity":0.05}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Holi',
     'headline', 'Colour the table sweet.',
     'body', 'Gulab Jamun, Motichoor Ladoo, and seasonal favourites. Boxes that travel well to a festival party.',
     'ctaLabel', 'Shop Holi sweets',
     'ctaHref', '/category/sweets',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/08/gulabilu.webp'
   ),
   null),
  ('pongal',
   'Pongal — turmeric & jaggery',
   false,
   '{"base":"#fff4e3","accent":"#7b4610","glow":"#d6a74c","ink":"#2a1a08","grainOpacity":0.05}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Pongal · Sankranti',
     'headline', 'A pot for the kitchen, sweet for the day.',
     'body', 'Our Pongal Pot Set arrives with everything you need — clay pot, jaggery-cardamom mix, and a sprig of dried banana leaf.',
     'ctaLabel', 'Shop the Pongal pot',
     'ctaHref', '/product/pongal-pot-set',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/besan_laddu-removebg-preview.png'
   ),
   null),
  ('dussehra',
   'Dussehra — marigold gold',
   false,
   '{"base":"#fff4e3","accent":"#c0592b","glow":"#e9b07a","ink":"#3a1e0c","grainOpacity":0.06}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Vijayadashami · Dussehra',
     'headline', 'Victory tastes sweet.',
     'body', 'Mark the festival with a Grande hamper. Logo-printed corporate runs available with 10-day lead time.',
     'ctaLabel', 'Shop Dussehra hampers',
     'ctaHref', '/category/gift-hampers',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/cashew_mithai-removebg-preview.png'
   ),
   null),
  ('christmas',
   'Christmas — cardamom warmth',
   false,
   '{"base":"#fff4e3","accent":"#9c2a2a","glow":"#d4a96b","ink":"#2a1a04","grainOpacity":0.05}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Christmas · Year-end gifting',
     'headline', 'A warmer kind of present.',
     'body', 'Year-end client gifting, multi-address CSV delivery, GST-compliant invoices. Cardamom Soan Papdi pairs with chai better than fruitcake.',
     'ctaLabel', 'Shop year-end hampers',
     'ctaHref', '/corporate#catalogue',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/anjjeer_katli-removebg-preview.png'
   ),
   'Year-end corporate runs — book by 15 Dec'),
  ('onam',
   'Onam — sadhya cream',
   false,
   '{"base":"#fff4e3","accent":"#7b4610","glow":"#d4a96b","ink":"#2a1a04","grainOpacity":0.05}'::jsonb,
   jsonb_build_object(
     'eyebrow', 'Onam',
     'headline', 'Payasam, the slow way.',
     'body', 'Coconut-jaggery payasam, fresh-ground rice for ada, and a tin of butter biscuits. Onam runs to Bangalore + Kerala addresses.',
     'ctaLabel', 'Shop Onam',
     'ctaHref', '/category/sweets',
     'imageUrl', 'https://ravisweets.com/wp-content/uploads/2025/09/badam_butter_burfi-removebg-preview.png'
   ),
   null)
on conflict (id) do nothing;
