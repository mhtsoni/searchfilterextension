/*
  # Create tables for Chrome extension search filter

  1. New Tables
    - `banned_websites`
      - `id` (serial, primary key)
      - `domain` (text, not null)
      - `location` (text, not null)
      - `created_at` (timestamptz)
    - `user_preferences`
      - `id` (serial, primary key)
      - `user_id` (text, not null)
      - `blocked_domains` (text array)
      - `override_domains` (text array)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create banned_websites table
CREATE TABLE IF NOT EXISTS banned_websites (
  id serial PRIMARY KEY,
  domain text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  blocked_domains text[] DEFAULT '{}',
  override_domains text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE banned_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read banned websites"
  ON banned_websites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);