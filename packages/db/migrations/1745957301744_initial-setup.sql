-- Up Migration

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add status column
CREATE TYPE user_status AS ENUM ('active', 'disabled', 'invited');

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    status user_status NOT NULL DEFAULT 'active',
    name text,
    email text UNIQUE,
    last_interaction_at timestamptz,
    time_zone text
);

CREATE TABLE credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    provider_account_id text,
    email text,
    label text,
    tokens jsonb NOT NULL,
    "primary" boolean,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_credentials_timestamp
BEFORE UPDATE ON credentials
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
COMMENT ON COLUMN "users"."email_verified" IS 'Whether the user email is verified';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
COMMENT ON COLUMN "users"."image" IS 'The image URL of the user';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now();
COMMENT ON COLUMN "users"."updated_at" IS 'The time when the user was last updated';

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users" ("id"),
    "token" TEXT NOT NULL UNIQUE,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_timestamp_sessions
BEFORE UPDATE ON "sessions"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON COLUMN "sessions"."id" IS 'Unique identifier for each session';
COMMENT ON COLUMN "sessions"."user_id" IS 'The id of the user';
COMMENT ON COLUMN "sessions"."token" IS 'The unique session token';
COMMENT ON COLUMN "sessions"."expires_at" IS 'The time when the session expires';
COMMENT ON COLUMN "sessions"."ip_address" IS 'The IP address of the device';
COMMENT ON COLUMN "sessions"."user_agent" IS 'The user agent information of the device';
COMMENT ON COLUMN "sessions"."created_at" IS 'The time when the session was created';
COMMENT ON COLUMN "sessions"."updated_at" IS 'The time when the session was last updated';

CREATE TABLE IF NOT EXISTS "accounts" (
    "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users" ("id"),
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_timestamp_accounts
BEFORE UPDATE ON "accounts"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON COLUMN "accounts"."id" IS 'Unique identifier for each account';
COMMENT ON COLUMN "accounts"."user_id" IS 'The id of the user';
COMMENT ON COLUMN "accounts"."account_id" IS 'The id of the account as provided by the SSO or equal to user_id for credential accounts';
COMMENT ON COLUMN "accounts"."provider_id" IS 'The id of the provider';
COMMENT ON COLUMN "accounts"."access_token" IS 'The access token of the account. Returned by the provider';
COMMENT ON COLUMN "accounts"."refresh_token" IS 'The refresh token of the account. Returned by the provider';
COMMENT ON COLUMN "accounts"."access_token_expires_at" IS 'The time when the access token expires';
COMMENT ON COLUMN "accounts"."refresh_token_expires_at" IS 'The time when the refresh token expires';
COMMENT ON COLUMN "accounts"."scope" IS 'The scope of the account. Returned by the provider';
COMMENT ON COLUMN "accounts"."id_token" IS 'The id token returned from the provider';
COMMENT ON COLUMN "accounts"."password" IS 'The password of the account. Mainly used for email and password authentication';
COMMENT ON COLUMN "accounts"."created_at" IS 'The time when the account was created';
COMMENT ON COLUMN "accounts"."updated_at" IS 'The time when the account was last updated';

CREATE TABLE IF NOT EXISTS "verifications" (
    "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_timestamp_verifications
BEFORE UPDATE ON "verifications"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON COLUMN "verifications"."id" IS 'Unique identifier for each verification';
COMMENT ON COLUMN "verifications"."identifier" IS 'The identifier for the verification request';
COMMENT ON COLUMN "verifications"."value" IS 'The value to be verified';
COMMENT ON COLUMN "verifications"."expires_at" IS 'The time when the verification request expires';
COMMENT ON COLUMN "verifications"."created_at" IS 'The time when the verification was created';
COMMENT ON COLUMN "verifications"."updated_at" IS 'The time when the verification was last updated';


-- Down Migration
DROP TABLE IF EXISTS credentials;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TYPE IF EXISTS message_role;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "accounts";
DROP TABLE IF EXISTS "verifications";
