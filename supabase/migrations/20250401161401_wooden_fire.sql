/*
  # Create diseases table and security policies

  1. New Tables
    - `diseases`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `diagnosis` (text, not null)
      - `treatment` (text, not null)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `diseases` table
    - Add policies for:
      - Public read access (anyone can view diseases)
      - Only authenticated users can create/update diseases
*/

CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  diagnosis text NOT NULL,
  treatment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view diseases"
  ON diseases
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create diseases"
  ON diseases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update diseases"
  ON diseases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);