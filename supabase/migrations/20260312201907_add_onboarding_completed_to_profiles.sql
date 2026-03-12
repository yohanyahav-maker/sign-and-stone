ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE profiles SET onboarding_completed = TRUE;
