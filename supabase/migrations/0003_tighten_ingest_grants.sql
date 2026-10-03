-- The website server always calls ingest_* with the public key and no user
-- session, so signed-in CRM users never need them.
revoke execute on function public.ingest_lead(text, text, jsonb) from authenticated;
revoke execute on function public.ingest_events(text, text, jsonb, jsonb) from authenticated;
