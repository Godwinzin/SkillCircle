alter table public.posts
  add column answer_count integer not null default 0
  check (answer_count >= 0);

-- Count the answers that already exist
update public.posts p
set answer_count = (
  select count(*) from public.answers a where a.post_id = p.id
);

create function public.update_post_answer_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set answer_count = answer_count + 1
      where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set answer_count = answer_count - 1
      where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger answers_update_post_count
  after insert or delete on public.answers
  for each row execute function public.update_post_answer_count();

notify pgrst, 'reload schema';