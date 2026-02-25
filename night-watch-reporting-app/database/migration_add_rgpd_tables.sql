-- Migration: add RGPD related tables
CREATE TABLE IF NOT EXISTS consents (
  user_id INT PRIMARY KEY,
  consent TINYINT(1) DEFAULT 0,
  given_at DATETIME
);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255),
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: ensure foreign keys if desired
-- ALTER TABLE consents ADD CONSTRAINT fk_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
