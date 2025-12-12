

# FullBlownAinz (FBA)

This is a production-ready, mobile-first, static web app designed for GitHub Pages. All dynamic content (posts, merch, apps, info) is persisted to a Supabase backend (Auth + Postgres + Storage) with Row Level Security.

The app runs securely as a static Single Page Application (SPA) using the Supabase JS client with public (anon) keys and strict RLS policies.

## Features

- **Static SPA:** No server required, perfect for GitHub Pages.
- **Supabase Backend:** Manages all data, authentication, and file storage.
- **Frontend Admin:** A complete in-app interface to manage all site content, theme, and settings.
- **Secure by Design:** Uses Supabase's Row Level Security to ensure only authenticated admins can write data. The service key is never exposed.
- **Unique UI/UX:** Features a distinctive "hatch" animation for revealing content.
- **Themable:** Colors, fonts, and even a header overlay can be changed live from the admin settings.
- **Disconnected Mode:** The app is fully navigable using sample data even before connecting to Supabase.

---

## 1. One-Time Supabase Setup

Follow these steps carefully to set up your Supabase backend. This is a one-time process.

### Step 1: Create Supabase Project

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Once the project is created, navigate to **Project Settings** (the gear icon).
3.  Go to the **API** section.
4.  You will need two values from this page for the in-app setup later:
    *   **Project URL**
    *   **Project API Keys** > `anon` `public` key

    Keep this page open or copy these values somewhere safe. **NEVER use the `service_role` key in the frontend application.**

### Step 2: Run SQL Migration

1.  In your Supabase project, go to the **SQL Editor** (the icon with `<SQL>`).
2.  Click **+ New query**.
3.  Copy the entire SQL script below and paste it into the editor.
4.  Click **RUN**. This will create all the necessary tables and enable Row Level Security (RLS).

```sql
-- Create custom types if needed (or use text)
-- (No custom types needed for this schema)

-- 1. PROFILES TABLE: Stores user data linked to auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  role text not null default 'user',
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
comment on table public.profiles is 'Stores public profile data for users, linked to auth.users.';


-- 2. POSTS TABLE: For THE.SCRL feed.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  title text not null default 'Untitled Post',
  header_media_url text not null,
  header_media_type text check (header_media_type in ('image','gif','video')) default 'image',
  body_richtext jsonb default '[]'::jsonb,
  external_links jsonb default '[]'::jsonb, -- e.g., [{"label": "View on X", "url": "..."}]
  hidden boolean default false,
  order_index int default 1000
);
alter table public.posts enable row level security;
comment on table public.posts is 'Content for THE.SCRL feed tiles.';


-- 3. MERCH TABLE: For THE.MERCH section.
create table if not exists public.merch (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  image_url text not null,
  price_cents int not null,
  currency text default 'USD',
  description text default '',
  external_url text not null,
  hidden boolean default false,
  order_index int default 1000
);
alter table public.merch enable row level security;
comment on table public.merch is 'Merchandise items for THE.MERCH gallery.';


-- 4. APPS TABLE: For THE.APPS section.
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  icon_url text not null,
  short_desc text default '',
  body_richtext jsonb default '[]'::jsonb,
  links jsonb default '[]'::jsonb, -- e.g., [{"label": "App Store", "url": "..."}]
  hidden boolean default false,
  order_index int default 1000
);
alter table public.apps enable row level security;
comment on table public.apps is 'Applications or projects for THE.APPS list.';


-- 5. SITE_INFO TABLE: For THE.INFO page content (single row).
create table if not exists public.site_info (
  id boolean primary key default true,
  body_richtext jsonb default '[]'::jsonb,
  constraint single_row_check check (id = true)
);
alter table public.site_info enable row level security;
comment on table public.site_info is 'Singleton table for the content of THE.INFO page.';
-- Insert the single row for site_info
insert into public.site_info (id, body_richtext) values (true, '[{"type":"heading","level":1,"content":"THE.INFO"},{"type":"paragraph","content":"This is the info page. You can edit this content once you log in as an admin."}]') on conflict (id) do nothing;


-- 6. SITE_SETTINGS TABLE: For theme and app settings (single row).
create table if not exists public.site_settings (
  id boolean primary key default true,
  colors jsonb default '{"bg":"#000000","fg":"#FFFFFF","accent":"#E10600"}'::jsonb,
  fonts jsonb default '{"display":"Press Start 2P","base":"Inter"}'::jsonb,
  header_overlay_url text,
  density text default 'M',
  constraint single_row_check check (id = true)
);
alter table public.site_settings enable row level security;
comment on table public.site_settings is 'Singleton table for global site visual settings.';
-- Insert the single row for site_settings
insert into public.site_settings (id) values (true) on conflict (id) do nothing;


-- RLS POLICIES

-- Helper function to check for admin role
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Policies for public content tables (posts, merch, apps, site_info, site_settings)
-- 1. Allow public read access
create policy "Allow public read access" on public.posts for select using (true);
create policy "Allow public read access" on public.merch for select using (true);
create policy "Allow public read access" on public.apps for select using (true);
create policy "Allow public read access" on public.site_info for select using (true);
create policy "Allow public read access" on public.site_settings for select using (true);

-- 2. Allow write access for admins
create policy "Allow insert for admins" on public.posts for insert with check (is_admin());
create policy "Allow update for admins" on public.posts for update using (is_admin());
create policy "Allow delete for admins" on public.posts for delete using (is_admin());

create policy "Allow insert for admins" on public.merch for insert with check (is_admin());
create policy "Allow update for admins" on public.merch for update using (is_admin());
create policy "Allow delete for admins" on public.merch for delete using (is_admin());

create policy "Allow insert for admins" on public.apps for insert with check (is_admin());
create policy "Allow update for admins" on public.apps for update using (is_admin());
create policy "Allow delete for admins" on public.apps for delete using (is_admin());

create policy "Allow update for admins" on public.site_info for update using (is_admin());
-- (No insert/delete for singleton tables)

create policy "Allow update for admins" on public.site_settings for update using (is_admin());
-- (No insert/delete for singleton tables)

-- Policies for profiles table
create policy "Allow self-read on profiles" on public.profiles for select using (auth.uid() = id);
create policy "Allow admin-read on profiles" on public.profiles for select using (is_admin());
create policy "Allow self-update on profiles" on public.profiles for update using (auth.uid() = id);

```

### Step 3: Create Storage Buckets

1.  In your Supabase project, go to **Storage**.
2.  Click **+ New bucket**.
3.  Create a bucket named `media`. **Make sure "Public bucket" is checked.**
4.  Create another bucket named `overlays`. **Make sure "Public bucket" is checked.**
5.  Now, let's add policies to restrict write access to admins. Go back to the **SQL Editor** and run the following policies for each bucket.

```sql
-- Policies for 'media' bucket
create policy "Allow public read on media"
on storage.objects for select
using ( bucket_id = 'media' );

create policy "Allow admin insert on media"
on storage.objects for insert
with check ( bucket_id = 'media' and is_admin() );

create policy "Allow admin update on media"
on storage.objects for update
using ( bucket_id = 'media' and is_admin() );

create policy "Allow admin delete on media"
on storage.objects for delete
using ( bucket_id = 'media' and is_admin() );

-- Policies for 'overlays' bucket
create policy "Allow public read on overlays"
on storage.objects for select
using ( bucket_id = 'overlays' );

create policy "Allow admin insert on overlays"
on storage.objects for insert
with check ( bucket_id = 'overlays' and is_admin() );

create policy "Allow admin update on overlays"
on storage.objects for update
using ( bucket_id = 'overlays' and is_admin() );

create policy "Allow admin delete on overlays"
on storage.objects for delete
using ( bucket_id = 'overlays' and is_admin() );
```

### Step 4: Create Admin User

1.  In your Supabase project, go to **Authentication**.
2.  Under the **Users** tab, click **+ Add user**.
3.  Enter an email and a strong password. Click **Create user**.
4.  Now, we need to assign the `admin` role to this new user. Go to the **Table Editor** (the table icon).
5.  Select the `profiles` table.
6.  Click **+ Insert row**.
7.  In the `id` field, paste the **UID** of the user you just created (you can find it on the Authentication > Users page).
8.  In the `username` field, enter `VD409`.
9.  In the `role` field, enter `admin`.
10. Click **Save**.

Your Supabase backend is now fully configured!

---

## 2. Connect App to Supabase

Once the application is running (either locally or on GitHub Pages):

1.  Click the **gear icon** in the top-right corner. This opens the login modal.
2.  Since you are not yet connected to Supabase, you can't log in. Click the link at the bottom that says **"Connect to Supabase"**.
3.  Paste your **Project URL** and your **`anon` `public` key** (from Step 1) into the fields.
4.  Click **Connect**.
5.  If successful, you will see a "Connected" status. You can now close this modal and log in with the admin user credentials you created in Step 4.

---

## 3. Deploy to GitHub Pages

1.  Create a new repository on GitHub.
2.  Push the entire codebase to the `main` branch of your new repository.
3.  In your GitHub repository, go to **Settings** > **Pages**.
4.  Under "Build and deployment", select the **Source** as **Deploy from a branch**.
5.  Select the branch as `main` and the folder as `/ (root)`.
6.  Click **Save**.

GitHub will now build and deploy your site. It may take a few minutes. You can then access it at the URL provided on the Pages settings screen.

---

## 4. Using the Admin Interface

After logging in, a "Settings" modal will appear.

-   **Aesthetics:** Change the site's colors, fonts, and header overlay live.
-   **Data & Connections:** Manage your Supabase connection.
-   **Security:** Change your admin password.
-   **Enter Edit Mode:** Click this button to close the settings and reveal admin controls throughout the app. You can then add, edit, reorder, and delete content on every page. All changes are saved to Supabase instantly.