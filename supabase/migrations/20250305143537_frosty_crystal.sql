/*
  # Premium Membership and Payment System

  1. New Tables
    - `premium_memberships`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `plan_type` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `membership_id` (uuid, references premium_memberships)
      - `amount` (numeric)
      - `currency` (text)
      - `payment_method` (text)
      - `transaction_id` (text)
      - `status` (text)
      - `receipt_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create premium_memberships table
CREATE TABLE IF NOT EXISTS premium_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES auth.users(id),
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES auth.users(id),
  membership_id uuid REFERENCES premium_memberships(id),
  amount numeric NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE premium_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for premium_memberships
CREATE POLICY "Users can view their own memberships"
  ON premium_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);