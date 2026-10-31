-- Lets comments point at an answer AND guarantee it belongs to the same post
alter table public.answers
  add constraint answers_id_post_unique unique (id, post_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  answer_id uuid,  -- null = comment on the question itself
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),

  constraint comment_body_length check (char_length(body) between 2 and 500),

  -- If answer_id is set, that answer must belong to this same post
  constraint comments_answer_fk
    foreign key (answer_id, post_id)
    references public.answers (id, post_id) on delete cascade
);

create index comments_post_idx on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Members can comment as themselves"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Members can delete their own comments"
  on public.comments for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- Only these columns can be written; comments can't be edited
revoke insert, update on public.comments from authenticated;
grant insert (post_id, answer_id, author_id, body) on public.comments to authenticated;

notify pgrst, 'reload schema';