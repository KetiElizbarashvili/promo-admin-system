-- Staff Users Table
CREATE TABLE staff_users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'STAFF')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff_users(email);
CREATE INDEX idx_staff_username ON staff_users(username);

-- Staff Email Verification Table (for initial staff creation)
CREATE TABLE staff_email_verification (
  id SERIAL PRIMARY KEY,
  staff_email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_verification_email ON staff_email_verification(staff_email);

-- Participants Table
CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  unique_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gov_id VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  total_points INT NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  active_points INT NOT NULL DEFAULT 0 CHECK (active_points >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_participant_unique_id ON participants(unique_id);
CREATE INDEX idx_participant_phone ON participants(phone);
CREATE INDEX idx_participant_email ON participants(email);
CREATE INDEX idx_participant_gov_id ON participants(gov_id);
CREATE INDEX idx_leaderboard ON participants(total_points DESC, created_at ASC);

-- Participant Verification Table (for registration OTP)
CREATE TABLE participant_verification (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_code_hash VARCHAR(255),
  email_code_hash VARCHAR(255),
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  attempts_phone INT NOT NULL DEFAULT 0,
  attempts_email INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participant_verification_phone ON participant_verification(phone);
CREATE INDEX idx_participant_verification_email ON participant_verification(email);

-- Prizes Table
CREATE TABLE prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  cost_points INT NOT NULL CHECK (cost_points > 0),
  stock_qty INT CHECK (stock_qty >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prize_status ON prizes(status);

-- Transaction Log Table
CREATE TABLE transaction_log (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'REGISTER',
    'ADD_POINTS',
    'REDEEM',
    'ADJUST',
    'STAFF_CREATE',
    'RESET_PASSWORD',
    'LOCK_PARTICIPANT',
    'UNLOCK_PARTICIPANT'
  )),
  participant_id INT REFERENCES participants(id) ON DELETE SET NULL,
  staff_user_id INT REFERENCES staff_users(id) ON DELETE SET NULL,
  points_change INT,
  prize_id INT REFERENCES prizes(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transaction_participant ON transaction_log(participant_id);
CREATE INDEX idx_transaction_staff ON transaction_log(staff_user_id);
CREATE INDEX idx_transaction_type ON transaction_log(type);
CREATE INDEX idx_transaction_created ON transaction_log(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
