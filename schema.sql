CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,             
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_media (
  id TEXT PRIMARY KEY,                       
  user_id TEXT NULL,  
  anonymous_id TEXT NULL,                  
  r2_key TEXT NOT NULL,                 
  url TEXT NOT NULL,                        
  original_name TEXT NOT NULL,               
  mime_type TEXT NOT NULL,                   
  size_bytes INTEGER NOT NULL,            
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INSERT INTO users (id, email, password)
-- VALUES (
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
--   '2025agvrobotics.team@gmail.com',
--   '@team2025'
-- );

-- SELECT 
--     um.id AS media_id,
--     um.user_id,
--     u.email AS user_email,
--     um.r2_key,
--     um.url
-- FROM 
--     user_media um
-- INNER JOIN 
--     users u 
-- ON 
--     um.user_id = u.id;
