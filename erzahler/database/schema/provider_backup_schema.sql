--sudo -u postgres psql < database/schema/provider_backup_schema.sql

DROP DATABASE IF EXISTS provider_backup;
CREATE DATABASE provider_backup;

\c provider_backup;

\echo 'Attempting to create user table'

CREATE TABLE IF NOT EXISTS users(
  user_id SERIAL,
  username VARCHAR(100) NOT NULL,
  signup_date TIMESTAMP NOT NULL,
  PRIMARY KEY(user_id)
);

CREATE TABLE IF NOT EXISTS providers(
  provider_id SERIAL,
  user_id INTEGER NOT NULL,
  provider_type VARCHAR NOT NULL,
  uid VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  display_name VARCHAR,
  phone_number VARCHAR,
  photo_url VARCHAR,
  PRIMARY KEY(provider_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);