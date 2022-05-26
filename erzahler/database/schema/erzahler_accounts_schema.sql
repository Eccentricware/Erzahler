--sudo -u postgres psql < database/schema/erzahler_accounts_schema.sql

DROP DATABASE IF EXISTS erzahler_auth;
CREATE DATABASE erzahler_auth;

\c erzahler_auth;

\echo 'Attempting to create user table'
CREATE TABLE IF NOT EXISTS users(
  user_id SERIAL,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_timestamp TIMESTAMP NOT NULL,
  creation_time_string VARCHAR(50) NOT NULL,
  last_login_stamp TIMESTAMP NOT NULL,
  last_login_time_string VARCHAR(50) NOT NULL,
  PRIMARY KEY(user_id)
);

\echo 'Attempting to create firebase_users table'
CREATE TABLE IF NOT EXISTS firebase_users(
  firebase_user_id SERIAL,
  user_id INTEGER NOT NULL,
  firebase_uid VARCHAR(150) NOT NULL,
  username_linked BOOLEAN NOT NULL DEFAULT false,
  created_timestamp TIMESTAMP NOT NULL,
  creation_time_string VARCHAR(50) NOT NULL,
  last_login_stamp TIMESTAMP NOT NULL,
  last_login_time_string VARCHAR(50) NOT NULL,
  PRIMARY KEY(firebase_user_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create providers table'
CREATE TABLE IF NOT EXISTS providers(
  provider_id SERIAL,
  firebase_user_id INTEGER NOT NULL,
  provider_type VARCHAR NOT NULL,
  uid VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  display_name VARCHAR,
  phone_number VARCHAR,
  photo_url VARCHAR,
  PRIMARY KEY(provider_id),
  FOREIGN KEY(firebase_user_id)
    REFERENCES firebase_users(firebase_user_id)
);