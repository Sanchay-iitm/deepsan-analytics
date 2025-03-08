/*
  # Create premium users table

  1. New Tables
    - `premium_users`: Stores information about premium subscribers
      - `id` (uuid, primary key)
      - `username` (text): Hive username of the subscriber
      - `subscription_start` (timestamptz): When the subscription started
      - `subscription_end` (timestamptz): When the subscription will end
      - `plan_type` (text): Type of subscription plan (monthly, yearly)
      - `payment_method` (text): Method used for payment
      - `payment_id` (text): ID from payment processor
      - `is_active` (boolean): Whether the subscription is currently active

  2. Security
    - Enable RLS on premium_users table
    - Add policies for authenticated users
*/
_type text NOT NULL,
  payment_method text DEFAULT 'hive',
  payment_id text,
  is_acti
CREATE TABLE IF NOT EXISTS premium_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  subscription_start timestamptz DEFAULT now(),
  subscription_end timestamptz NOT NULL,
  planve boolean DEFAULT true,
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