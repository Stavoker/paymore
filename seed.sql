-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  parent_id bigint,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.device_characteristics (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_id bigint NOT NULL,
  name text NOT NULL,
  value text NOT NULL,
  unit text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT device_characteristics_pkey PRIMARY KEY (id),
  CONSTRAINT device_characteristics_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id)
);
CREATE TABLE public.device_variants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_id bigint NOT NULL,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  ram text,
  storage text,
  color text,
  sku text,
  gtin text,
  mpn text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT device_variants_pkey PRIMARY KEY (id),
  CONSTRAINT device_variants_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id)
);
CREATE TABLE public.devices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  gtin text,
  mpn text,
  category_id bigint,
  subcategory_id bigint,
  icon text,
  device_image text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT devices_pkey PRIMARY KEY (id),
  CONSTRAINT devices_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT devices_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id)
);
CREATE TABLE public.price_list (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  variant_id bigint NOT NULL,
  device_id bigint,
  device_name text NOT NULL,
  device_key text NOT NULL,
  brand text,
  model text,
  category_id bigint,
  subcategory_id bigint,
  buy_min numeric,
  resale_floor numeric,
  retail_price numeric,
  currency text DEFAULT 'USD'::text,
  icon text,
  device_image text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT price_list_pkey PRIMARY KEY (id),
  CONSTRAINT price_list_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.device_variants(id),
  CONSTRAINT price_list_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id),
  CONSTRAINT price_list_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT price_list_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id)
);
CREATE TABLE public.subcategories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  category_id bigint NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- Categories
insert into public.categories (key, label, sort_order)
values
('phones', 'Phones', 1),
('laptops', 'Laptops', 2);

-- Subcategories
insert into public.subcategories (key, label, category_id, sort_order)
values
('iphone', 'iPhone', 1, 1),
('macbook', 'MacBook', 2, 1);

-- Devices
insert into public.devices (key, label, brand, model, category_id, subcategory_id, device_image, icon)
values
('iphone-15-pro', 'iPhone 15 Pro', 'Apple', 'A3102', 1, 1, 'https://example.com/iphone-15-pro.png', '📱'),
('macbook-pro-14', 'MacBook Pro 14"', 'Apple', 'A2938', 2, 2, 'https://example.com/macbook-pro-14.png', '💻');


-- iPhone 15 Pro Variants
insert into public.device_variants (device_id, key, label, ram, storage, color, sku, gtin)
values
(1, 'iphone-15-pro-128gb', 'iPhone 15 Pro - 128GB', '8GB', '128GB', 'Blue Titanium', 'APL-15P-128', '0194253443879'),
(1, 'iphone-15-pro-256gb', 'iPhone 15 Pro - 256GB', '8GB', '256GB', 'Blue Titanium', 'APL-15P-256', '0194253443886'),
(1, 'iphone-15-pro-512gb', 'iPhone 15 Pro - 512GB', '8GB', '512GB', 'Natural Titanium', 'APL-15P-512', '0194253443893');

-- MacBook Pro 14 Variants
insert into public.device_variants (device_id, key, label, ram, storage, color, sku, gtin)
values
(2, 'macbook-pro-14-16-512', 'MacBook Pro 14" - 16GB / 512GB', '16GB', '512GB', 'Space Gray', 'APL-MBP14-16-512', '0194253412164'),
(2, 'macbook-pro-14-32-1tb', 'MacBook Pro 14" - 32GB / 1TB', '32GB', '1TB', 'Silver', 'APL-MBP14-32-1TB', '0194253412171');


-- iPhone 15 Pro Specs
insert into public.device_characteristics (device_id, name, value, unit)
values
(1, 'Processor', 'A17 Pro', null),
(1, 'Battery', '4422', 'mAh'),
(1, 'Display', '6.1-inch Super Retina XDR', null),
(1, 'Camera', '48MP main, 12MP ultra-wide', null),
(1, 'Charging Port', 'USB-C', null);

-- MacBook Pro 14 Specs
insert into public.device_characteristics (device_id, name, value, unit)
values
(2, 'Processor', 'Apple M3 Pro', null),
(2, 'Battery', '70', 'Wh'),
(2, 'Display', '14.2-inch Liquid Retina XDR', null),
(2, 'Ports', 'HDMI, SDXC, MagSafe 3', null),
(2, 'Camera', '1080p FaceTime HD', null);

-- iPhone 15 Pro Prices
insert into public.price_list (variant_id, device_id, device_name, device_key, brand, model, category_id, subcategory_id, buy_min, resale_floor, retail_price, currency)
values
(1, 1, 'iPhone 15 Pro - 128GB', 'iphone-15-pro-128gb', 'Apple', 'A3102', 1, 1, 900.00, 1100.00, 1199.00, 'USD'),
(2, 1, 'iPhone 15 Pro - 256GB', 'iphone-15-pro-256gb', 'Apple', 'A3102', 1, 1, 950.00, 1150.00, 1299.00, 'USD'),
(3, 1, 'iPhone 15 Pro - 512GB', 'iphone-15-pro-512gb', 'Apple', 'A3102', 1, 1, 1050.00, 1250.00, 1499.00, 'USD');

-- MacBook Pro 14 Prices
insert into public.price_list (variant_id, device_id, device_name, device_key, brand, model, category_id, subcategory_id, buy_min, resale_floor, retail_price, currency)
values
(4, 2, 'MacBook Pro 14" - 16GB / 512GB', 'macbook-pro-14-16-512', 'Apple', 'A2938', 2, 2, 1600.00, 1800.00, 1999.00, 'USD'),
(5, 2, 'MacBook Pro 14" - 32GB / 1TB', 'macbook-pro-14-32-1tb', 'Apple', 'A2938', 2, 2, 2000.00, 2200.00, 2499.00, 'USD');


create index idx_category_id on public.devices (category_id);
create index idx_subcategory_id on public.devices (subcategory_id);
create index idx_variant_device_id on public.device_variants (device_id);
create index idx_price_variant_id on public.price_list (variant_id);
