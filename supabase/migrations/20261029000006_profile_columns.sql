revoke update on public.profiles from authenticated;
grant update (username, full_name, bio, avatar_url, level)
  on public.profiles to authenticated;