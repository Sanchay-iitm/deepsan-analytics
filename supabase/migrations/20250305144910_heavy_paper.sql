/*
  # Create premium membership and payment tables

  1. New Tables
    - `premium_memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_type` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `membership_id` (uuid, foreign key)
      - `amount` (numeric)
      - `currency` (text)
      - `payment_method` (text)
      - `transaction_id` (text)
      - `status` (text)
      - `receipt_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
*/

-- Create premium_memberships table
CREATE TABLE IF NOT EXISTS premium_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  membership_id uuid NOT NULL REFERENCES premium_memberships(id),
  amount numeric NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE premium_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for premium_memberships
CREATE POLICY "Users can read own memberships"
  ON premium_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memberships"
  ON premium_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for payments
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_premium_memberships_updated_at
  BEFORE UPDATE ON premium_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();