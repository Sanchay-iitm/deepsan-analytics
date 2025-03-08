/*
  # Create premium users table

  1. New Tables
    - `premium_users`
      - `id` (uuid, primary key)
      - `username` (text, not null)
      - `subscription_start` (timestamptz)
      - `subscription_end` (timestamptz)
      - `plan_type` (text, not null)
      - `payment_method` (text)
      - `payment_id` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `premium_users` table
    - Add policies for public read access
    - Add policies for authenticated users to insert and update
*/

CREATE TABLE IF NOT EXISTS premium_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  subscription_start timestamptz DEFAULT now(),
  subscription_end timestamptz NOT NULL,
  plan_type text NOT NULL,
  payment_method text DEFAULT 'hive',
  payment_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to premium_users"
  ON premium_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert premium_users"
  ON premium_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own premium_users"
  ON premium_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = username)
  WITH CHECK (auth.uid()::text = username);