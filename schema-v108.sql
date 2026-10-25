alter table public.menu_plans add column if not exists all_children_same boolean not null default false;
drop policy if exists profiles_family_read on public.profiles;
create policy profiles_family_read on public.profiles for select using(id=auth.uid() or public.is_family_member(family_id));
