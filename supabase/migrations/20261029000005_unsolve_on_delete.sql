create function public.unsolve_post_when_accepted_answer_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.is_accepted then
    update public.posts set is_solved = false where id = old.post_id;
  end if;
  return old;
end;
$$;

create trigger answers_unsolve_post
  after delete on public.answers
  for each row execute function public.unsolve_post_when_accepted_answer_deleted();