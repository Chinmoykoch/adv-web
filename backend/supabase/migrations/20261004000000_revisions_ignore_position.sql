-- Reordering items (changing only `position`) is not a content change, so it no longer
-- creates a history entry. Everything else about keep_revision is unchanged.
create or replace function public.keep_revision()
returns trigger
language plpgsql
as $$
declare
  ignored text[] := array['updated_at', 'updated_by', 'revision', 'position'];
begin
  if tg_op = 'DELETE' then
    insert into public.content_revisions (entity, row_id, revision, action, snapshot, saved_by, saved_at)
    values (tg_table_name, old.id, old.revision, 'delete', to_jsonb(old), old.updated_by, old.updated_at);
    return old;
  end if;

  if (to_jsonb(new) - ignored) is distinct from (to_jsonb(old) - ignored) then
    insert into public.content_revisions (entity, row_id, revision, action, snapshot, saved_by, saved_at)
    values (tg_table_name, old.id, old.revision, 'update', to_jsonb(old), old.updated_by, old.updated_at);
    new.revision := old.revision + 1;
  else
    new.revision := old.revision;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
