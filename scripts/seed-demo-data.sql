-- Insert demo organization
INSERT INTO organizations (id, name, created_at) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo project
INSERT INTO projects (id, org_id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Demo Project', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo API key (the actual key is "demo_key_change_this", but we store the bcrypt hash)
-- Hash generated with: bcrypt.hash("demo_key_change_this", 10)
INSERT INTO api_keys (org_id, key_hash, active, created_at, last_used_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '$2b$10$YourBcryptHashHereChangeThis1234567890abcdefghijklmnopqrstuv',
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

SELECT 'Seed data inserted successfully' AS status;
