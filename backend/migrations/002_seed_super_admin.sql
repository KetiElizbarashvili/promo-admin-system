-- Seed initial Super Admin
-- Password: Admin@123
-- Username: superadmin
-- IMPORTANT: Change password immediately after first login in production!

INSERT INTO staff_users (
  first_name,
  last_name,
  email,
  username,
  password_hash,
  role,
  status
) VALUES (
  'Super',
  'Admin',
  'admin@kitkat-promo.com',
  'superadmin',
  '$2b$10$wlimU52mJWB6N45pJHaXkeelUDKfhmYzGk/mv3tAhr4/29NR9qsuq',
  'SUPER_ADMIN',
  'ACTIVE'
)
ON CONFLICT (username) DO NOTHING;
-- Use bcrypt to generate a new hash and update this record.
