-- The running total, kept in sync by a trigger
alter table public.answers
  add column vote_count integer not null default 0
  check (vote_count >= 0);

create table public.answer_votes (
  answer_id uuid not null references public.answers (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- One vote per member per answer, enforced by the database
  primary key (answer_id, user_id)
);

create index answer_votes_user_idx on public.answer_votes (user_id);

alter table public.answer_votes enable row level security;

-- You can only ever see your own votes
create policy "Members can see their own votes"
  on public.answer_votes for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- You can vote as yourself, but not on your own answer
create policy "Members can vote on other people's answers"
  on public.answer_votes for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.answers a
      where a.id = answer_id
        and a.author_id = (select auth.uid())
    )
  );

create policy "Members can remove their own votes"
  on public.answer_votes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Keep answers.vote_count correct
create function public.update_answer_vote_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.answers set vote_count = vote_count + 1
      where id = new.answer_id;
  elsif tg_op = 'DELETE' then
    update public.answers set vote_count = vote_count - 1
      where id = old.answer_id;
  end if;
  return null;
end;
$$;

create trigger answer_votes_count
  after insert or delete on public.answer_votes
  for each row execute function public.update_answer_vote_count();

-- Column permissions on INSERT, so nobody can create rows with fake counters.
-- (Earlier we limited UPDATE; this closes the same gap for INSERT.)
revoke insert on public.answers from authenticated;
grant insert (post_id, author_id, body) on public.answers to authenticated;

revoke insert on public.posts from authenticated;
grant insert (author_id, category_id, title, body) on public.posts to authenticated;