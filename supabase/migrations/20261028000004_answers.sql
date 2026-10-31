create table public.answers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint answer_body_length check (char_length(body) between 5 and 5000)
);

create index answers_post_idx on public.answers (post_id, created_at);
create index answers_author_idx on public.answers (author_id);

-- A post can have at most one accepted answer
create unique index answers_one_accepted_per_post
  on public.answers (post_id) where is_accepted;

alter table public.answers enable row level security;

create policy "Answers are viewable by everyone"
  on public.answers for select
  using (true);

-- New answers can't start out accepted
create policy "Users can create their own answers"
  on public.answers for insert
  to authenticated
  with check ((select auth.uid()) = author_id and is_accepted = false);

create policy "Users can update their own answers"
  on public.answers for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Users can delete their own answers"
  on public.answers for delete
  to authenticated
  using ((select auth.uid()) = author_id);

create trigger answers_set_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();

-- Column-level permissions: members may edit only the text, never the status flags
revoke update on public.answers from authenticated;
grant update (body) on public.answers to authenticated;

-- Close the gap we left in posts: is_solved can no longer be edited directly
revoke update on public.posts from authenticated;
grant update (title, body, category_id) on public.posts to authenticated;

-- The only way to accept an answer
create function public.accept_answer(p_answer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_id uuid;
begin
  -- The answer must exist, and the caller must be the author of its post
  select a.post_id into v_post_id
  from public.answers a
  join public.posts p on p.id = a.post_id
  where a.id = p_answer_id
    and p.author_id = (select auth.uid());

  if v_post_id is null then
    raise exception 'Not allowed, or answer not found';
  end if;

  update public.answers set is_accepted = false
    where post_id = v_post_id and is_accepted;
  update public.answers set is_accepted = true
    where id = p_answer_id;
  update public.posts set is_solved = true
    where id = v_post_id;
end;
$$;

-- revoke access from visitors
revoke execute on function public.accept_answer(uuid) from public, anon;
-- grant it only to logged-in users
grant execute on function public.accept_answer(uuid) to authenticated;