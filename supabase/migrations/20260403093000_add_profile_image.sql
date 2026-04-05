ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS profile_image text DEFAULT '';
