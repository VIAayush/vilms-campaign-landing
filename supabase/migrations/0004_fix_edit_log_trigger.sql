-- Fix: `text[] || 'literal'` resolves to array-concat and fails with
-- "malformed array literal", so every edit of a lead's contact details errored.
-- Use array_append for the changed-fields list.

create or replace function private.leads_log_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_fields text[] := '{}';
begin
  if v_actor is not null and not exists (select 1 from public.crm_members where id = v_actor) then
    v_actor := null;
  end if;

  if new.status is distinct from old.status then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'assigned', jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to));
  end if;
  if new.priority is distinct from old.priority then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'priority_changed', jsonb_build_object('from', old.priority, 'to', new.priority));
  end if;
  if new.next_follow_up_at is distinct from old.next_follow_up_at then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'follow_up_set', jsonb_build_object('at', new.next_follow_up_at));
  end if;
  if new.is_spam is distinct from old.is_spam then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'spam_flagged', jsonb_build_object('is_spam', new.is_spam));
  end if;

  if new.full_name      is distinct from old.full_name      then v_fields := array_append(v_fields, 'full_name'); end if;
  if new.institute_name is distinct from old.institute_name then v_fields := array_append(v_fields, 'institute_name'); end if;
  if new.email          is distinct from old.email          then v_fields := array_append(v_fields, 'email'); end if;
  if new.phone          is distinct from old.phone          then v_fields := array_append(v_fields, 'phone'); end if;
  if new.city           is distinct from old.city           then v_fields := array_append(v_fields, 'city'); end if;
  if new.institute_type is distinct from old.institute_type then v_fields := array_append(v_fields, 'institute_type'); end if;
  if new.student_count  is distinct from old.student_count  then v_fields := array_append(v_fields, 'student_count'); end if;
  if new.website        is distinct from old.website        then v_fields := array_append(v_fields, 'website'); end if;
  if new.current_lms    is distinct from old.current_lms    then v_fields := array_append(v_fields, 'current_lms'); end if;
  if new.interest       is distinct from old.interest       then v_fields := array_append(v_fields, 'interest'); end if;
  if new.message        is distinct from old.message        then v_fields := array_append(v_fields, 'message'); end if;
  if cardinality(v_fields) > 0 then
    insert into public.lead_activities (lead_id, actor_id, type, meta)
    values (new.id, v_actor, 'updated', jsonb_build_object('fields', to_jsonb(v_fields)));
  end if;

  return null;
end $$;
