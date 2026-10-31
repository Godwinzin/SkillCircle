alter table public.posts
  add column search tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored;

create index posts_search_idx on public.posts using gin (search);

notify pgrst, 'reload schema';