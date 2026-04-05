/*
  # Create Resumes Table

  ## Overview
  This migration creates the core database structure for CVLuck, a SaaS resume builder application.

  ## New Tables
  
  ### `resumes`
  Stores all resume data created by users.
  
  - `id` (uuid, primary key) - Unique identifier for each resume
  - `user_id` (uuid, foreign key) - References auth.users, links resume to creator
  - `job_description` (text) - The job description used to optimize the resume
  - `name` (text) - Candidate's full name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone number
  - `location` (text) - Candidate's location
  - `summary` (text) - Professional summary/objective
  - `skills` (jsonb) - Array of skills
  - `experience` (jsonb) - Array of work experience objects
  - `education` (jsonb) - Array of education objects
  - `projects` (jsonb) - Array of project objects
  - `certifications` (jsonb) - Array of certifications
  - `template_id` (text) - Selected template identifier
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `resumes` table
  - Users can only view their own resumes
  - Users can only create resumes for themselves
  - Users can only update their own resumes
  - Users can only delete their own resumes
  
  ## Notes
  1. All JSON fields use jsonb for efficient querying
  2. Foreign key constraint ensures data integrity with auth.users
  3. Timestamps use timestamptz for timezone awareness
  4. Default values ensure clean data creation
*/

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_description text DEFAULT '',
  name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  location text DEFAULT '',
  summary text DEFAULT '',
  skills jsonb DEFAULT '[]'::jsonb,
  experience jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  template_id text DEFAULT 'modern',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own resumes
CREATE POLICY "Users can create own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);

-- Create index for faster queries by created_at
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON resumes(created_at DESC);