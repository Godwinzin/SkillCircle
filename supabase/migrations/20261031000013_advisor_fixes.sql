-- Trigger functions only run when a table changes, so nobody needs to call them directly
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_answer_vote_count() from public, anon, authenticated;
revoke execute on function public.update_post_answer_count() from public, anon, authenticated;
revoke execute on function public.unsolve_post_when_accepted_answer_deleted() from public, anon, authenticated;

-- Deleting an answer also deletes its comments, which needs this lookup to be fast
create index comments_answer_idx on public.comments (answer_id, post_id);