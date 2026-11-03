-- Client project requests (demandes client) from the contact form
CREATE TABLE IF NOT EXISTS client_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  services      TEXT[] NOT NULL DEFAULT '{}',
  budget        TEXT,
  message       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_requests_created_at_idx
  ON client_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS client_requests_email_idx
  ON client_requests (email);
