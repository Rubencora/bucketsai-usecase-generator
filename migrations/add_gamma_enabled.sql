-- Add gamma_enabled column to users table
-- Controls which users can generate decks via Gamma (premium)
-- Admin users always have access regardless of this flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS gamma_enabled BOOLEAN DEFAULT false;
