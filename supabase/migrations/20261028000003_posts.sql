create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  category_id smallint not null references public.categories (id),
  title text not null,
  body text not null,
  is_solved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint title_length check (char_length(title) between 10 and 150),
  constraint body_length check (char_length(body) between 20 and 10000)
);

-- Indexes for the queries we'll run most: feed by category, posts by author
create index posts_category_created_idx on public.posts (category_id, created_at desc);
create index posts_author_idx on public.posts (author_id);

alter table public.posts enable row level security;

-- Anyone can read posts
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Logged-in users can create posts, only as themselves
create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

-- Authors can edit their own posts
create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

-- Authors can delete their own posts
create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- Keep updated_at fresh on every edit
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();