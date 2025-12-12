CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,             
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, email, password)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '2025agvrobotics.team@gmail.com',
  '@team2025'
);
