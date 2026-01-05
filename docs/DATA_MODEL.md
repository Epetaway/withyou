# Data Model – WithYou

## users
- `id` (uuid, pk)
- `email` (string, unique)
- `password_hash` (string)
- `created_at` (timestamp)

## relationships
- `id` (uuid, pk)
- `user_a_id` (uuid, fk)
- `user_b_id` (uuid, fk)
- `status` (enum: 'active' | 'ended')
- `created_at` (timestamp)
- `ended_at` (timestamp, nullable)

**Constraint:** One active relationship per user

## invites
- `id` (uuid, pk)
- `code` (string, unique, 6-char alphanumeric)
- `inviter_user_id` (uuid, fk)
- `expires_at` (timestamp)
- `used_at` (timestamp, nullable)

## checkins
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `relationship_id` (uuid, fk)
- `mood` (int, 1–5)
- `note` (string, nullable)
- `reflection_prompt_id` (uuid, nullable)
- `reflection_response` (string, nullable)
- `shared` (boolean, default: false)
- `created_at` (timestamp)

## preferences
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `relationship_id` (uuid, fk)
- `activities` (string[], enum)
- `budget_comfort` (enum: 'low' | 'medium' | 'high')
- `energy_level` (enum: 'low' | 'medium' | 'high')
- `availability` (string)
- `values_json` (jsonb, nullable)
- `updated_at` (timestamp)

## weekly_reflections
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `relationship_id` (uuid, fk)
- `week_of` (date)
- `connected_moment` (string)
- `challenge` (string)
- `focus_next_week` (string)
- `shared` (boolean, default: false)
- `created_at` (timestamp)
