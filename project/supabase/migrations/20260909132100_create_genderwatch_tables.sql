/*
# GenderWatch Protocol Tables

## Summary
Creates tables for the GenderWatch Protocol Creator app. This is a single-tenant
no-auth app, so anon + authenticated roles can perform all CRUD operations.

## New Tables

### protocols
- id: uuid primary key
- name: text - the name/title of the protocol session
- created_at: timestamp

### speaking_events
- id: uuid primary key
- protocol_id: uuid foreign key → protocols
- gender: text - one of: 'female', 'male', 'tina_female', 'tina_male', 'tina_other'
- started_at: timestamptz - when this speaking turn began
- ended_at: timestamptz - when this speaking turn ended (null if still active)
- duration_ms: bigint - computed duration in milliseconds (filled on end)

## Security
- RLS enabled on both tables
- anon + authenticated can do full CRUD (single-tenant, no sign-in)
*/

CREATE TABLE IF NOT EXISTS protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_protocols" ON protocols;
CREATE POLICY "anon_select_protocols" ON protocols FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_protocols" ON protocols;
CREATE POLICY "anon_insert_protocols" ON protocols FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_protocols" ON protocols;
CREATE POLICY "anon_update_protocols" ON protocols FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_protocols" ON protocols;
CREATE POLICY "anon_delete_protocols" ON protocols FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS speaking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  gender text NOT NULL CHECK (gender IN ('female', 'male', 'tina_female', 'tina_male', 'tina_other')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms bigint
);

CREATE INDEX IF NOT EXISTS speaking_events_protocol_id_idx ON speaking_events(protocol_id);

ALTER TABLE speaking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_speaking_events" ON speaking_events;
CREATE POLICY "anon_select_speaking_events" ON speaking_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_speaking_events" ON speaking_events;
CREATE POLICY "anon_insert_speaking_events" ON speaking_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_speaking_events" ON speaking_events;
CREATE POLICY "anon_update_speaking_events" ON speaking_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_speaking_events" ON speaking_events;
CREATE POLICY "anon_delete_speaking_events" ON speaking_events FOR DELETE
  TO anon, authenticated USING (true);
