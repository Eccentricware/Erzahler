--sudo -u postgres psql < database/schema/erzahler_schema.sql

DROP DATABASE IF EXISTS erzahler_dev;
CREATE DATABASE erzahler_dev;

\c erzahler_dev;

\echo 'Attempting to create games table'

CREATE TABLE IF NOT EXISTS games(
  game_id SERIAL,
  game_name VARCHAR(50) UNIQUE NOT NULL,
  game_status VARCHAR(25) NOT NULL,
  current_year INTEGER NOT NULL,
  stylized_year_start VARCHAR(10),
  concurrent_games_limit INTEGER,
  private_game BOOLEAN,
  hidden_game BOOLEAN,
  blind_administrator BOOLEAN DEFAULT false,
  deadline_type VARCHAR(15),
  orders_deadline TIMESTAMP,
  retreats_deadline TIMESTAMP,
  adjustments_deadline TIMESTAMP,
  nominations_deadline TIMESTAMP,
  votes_deadline TIMESTAMP,
  nmr_removal INTEGER,
  vote_delay_lock INTEGER, --Minutes before the deadline before can't delay
  vote_delay_percent INTEGER, --Percent of players required to pass vote
  vote_delay_count INTEGER, --Number of players required to pass vote
  vote_delay_display_percent INTEGER, --Percent of players voting yes before public
  vote_delay_display_count INTEGER, --Count of players voting yes before public
  confirmation_time INTEGER, --How many minutes players have for final play confirmation. 0 waits indefinitely. Null is auto-accept.
  PRIMARY KEY(game_id)
);

\echo "Attempting to create rules table"
CREATE TABLE IF NOT EXISTS rules(
  rule_id SERIAL,
  rule_key VARCHAR(50) NOT NULL,
  rule_name VARCHAR(50) NOT NULL,
  rule_description VARCHAR(MAX),
  PRIMARY KEY(rule_id)
);

\echo "Attempting to create rules_in_games table"
CREATE TABLE IF NOT EXISTS rules_in_games(
  rule_in_game_id SERIAL,
  rule_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  rule_enabled BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY(rule_in_game_id),
  FOREIGN KEY(rule_id)
    REFERENCES rules(rule_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create turns table'
CREATE TABLE IF NOT EXISTS turns(
  turn_id SERIAL,
  game_id INTEGER NOT NULL,
  deadline TIMESTAMP NOT NULL,
  turn_number INTEGER NOT NULL,
  turn_name VARCHAR(50),
  turn_type VARCHAR(10) NOT NULL,
  turn_status VARCHAR(15) NOT NULL,
  PRIMARY KEY(turn_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create countries table'
CREATE TABLE IF NOT EXISTS countries(
  country_id SERIAL,
  game_id INTEGER NOT NULL,
  country_name VARCHAR(50) NOT NULL,
  rank VARCHAR(1) NOT NULL,
  color VARCHAR(7) NOT NULL,
  flag_key VARCHAR(20) NOT NULL,
  region VARCHAR(15),
  PRIMARY KEY(country_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create country_history table'
CREATE TABLE IF NOT EXISTS country_history(
  country_history_id SERIAL,
  country_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  country_status VARCHAR(15) NOT NULL,
  city_count INTEGER NOT NULL,
  unit_count INTEGER NOT NULL,
  banked_builds INTEGER NOT NULL,
  nuke_range INTEGER NOT NULL,
  adjustments INTEGER NOT NULL,
  PRIMARY KEY(country_history_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id)
);



\echo "Attempting to create alerts table"
CREATE TABLE IF NOT EXISTS alerts(
  alert_id SERIAL,
  game_id INTEGER NOT NULL,
  alert_type VARCHAR(15) NOT NULL,
  alert_time TIMESTAMP NOT NULL,
  alert_message VARCHAR(250),
  PRIMARY KEY(alert_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo "Attempting to create alert_read_receipts table"
CREATE TABLE IF NOT EXISTS alert_read_receipts(
  alert_read_receipt_id SERIAL,
  alert_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  alert_read BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY(alert_read_receipt_id),
  FOREIGN KEY(alert_id)
    REFERENCES alerts(alert_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create provinces table'
CREATE TABLE IF NOT EXISTS provinces(
  province_id SERIAL,
  game_id INTEGER NOT NULL,
  province_name VARCHAR(15) NOT NULL,
  province_fullname VARCHAR(25),
  province_type VARCHAR(15) NOT NULL,
  vote_type VARCHAR(15),
  PRIMARY KEY(province_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create terrain table'
CREATE TABLE IF NOT EXISTS terrain(
  terrain_id SERIAL,
  province_id INTEGER NOT NULL,
  render_category VARCHAR NOT NULL,
  points VARCHAR NOT NULL,
  top_bound INTEGER NOT NULL,
  left_bound INTEGER NOT NULL,
  right_bound INTEGER NOT NULL,
  bottom_bound INTEGER NOT NULL,
  PRIMARY KEY(terrain_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create bridges table'
CREATE TABLE IF NOT EXISTS bridges(
  bridge_id SERIAL,
  points VARCHAR NOT NULL,
  start_province INTEGER NOT NULL,
  end_province INTEGER NOT NULL,
  PRIMARY KEY(bridge_id),
  FOREIGN KEY(start_province)
    REFERENCES provinces(province_id),
  FOREIGN KEY(end_province)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create labels table'
CREATE TABLE IF NOT EXISTS labels(
  label_id SERIAL,
  province_id INTEGER NOT NULL,
  loc INTEGER [] NOT NULL,
  label_text VARCHAR(10),
  PRIMARY KEY(label_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create province_history table'
CREATE TABLE IF NOT EXISTS province_history(
  province_history_id SERIAL,
  province_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  controller_id INTEGER,
  capital_owner_id INTEGER,
  province_status VARCHAR NOT NULL,
  valid_retreat BOOLEAN,
  vote_color VARCHAR(7),
  status_color VARCHAR(7),
  PRIMARY KEY(province_history_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(controller_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(capital_owner_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create nodes table'
CREATE TABLE IF NOT EXISTS nodes(
  node_id SERIAL,
  province_id INTEGER NOT NULL,
  node_type VARCHAR(4) NOT NULL,
  loc INTEGER [] NOT NULL,
  PRIMARY KEY(node_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create node_adjacencies table'
CREATE TABLE IF NOT EXISTS node_adjacencies(
  node_adjacency_id SERIAL,
  node_1_id INTEGER NOT NULL,
  node_2_id INTEGER NOT NULL,
  PRIMARY KEY(node_adjacency_id),
  FOREIGN KEY(node_1_id)
    REFERENCES nodes(node_id),
  FOREIGN KEY(node_2_id)
    REFERENCES nodes(node_id)
);

\echo 'Attempting to create nominations table'
CREATE TABLE IF NOT EXISTS nominations(
  nomination_id SERIAL,
  turn_id INTEGER NOT NULL,
  nominator_id INTEGER NOT NULL,
  nomination_type VARCHAR(15) NOT NULL,
  country_1_id INTEGER,
  country_2_id INTEGER,
  country_3_id INTEGER,
  deadline TIMESTAMP NOT NULL,
  PRIMARY KEY(nomination_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(nominator_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(country_1_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(country_2_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(country_3_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create votes table'
CREATE TABLE IF NOT EXISTS votes(
  vote_id SERIAL,
  nomination_id INTEGER NOT NULL,
  voting_country_id INTEGER NOT NULL,
  vote VARCHAR(10) NOT NULL,
  PRIMARY KEY(vote_id),
  FOREIGN KEY(nomination_id)
    REFERENCES nominations(nomination_id),
  FOREIGN KEY(voting_country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create units table'
CREATE TABLE IF NOT EXISTS units(
  unit_id SERIAL,
  country_id INTEGER NOT NULL,
  unit_type VARCHAR(10) NOT NULL,
  PRIMARY KEY(unit_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create unit_history table'
CREATE TABLE IF NOT EXISTS unit_history(
  unit_history_id SERIAL,
  unit_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  node_id INTEGER,
  unit_status VARCHAR(15) NOT NULL,
  PRIMARY KEY(unit_history_id),
  FOREIGN KEY(unit_id)
    REFERENCES units(unit_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(node_id)
    REFERENCES nodes(node_id)
);

\echo 'Attempting to create users table'
CREATE TABLE IF NOT EXISTS users(
  user_id SERIAL,
  username VARCHAR(100) UNIQUE NOT NULL,
  username_locked BOOLEAN NOT NULL DEFAULT false,
  user_status VARCHAR(100) NOT NULL,
  time_zone VARCHAR(25),
  signup_time TIMESTAMP NOT NULL,
  last_sign_in_time TIMESTAMP NOT NULL,
  classic_unit_render BOOLEAN NOT NULL DEFAULT false,
  city_render_size INTEGER NOT NULL DEFAULT 2,
  label_render_size INTEGER NOT NULL DEFAULT 2,
  unit_render_size INTEGER NOT NULL DEFAULT 2,
  nmr_count INTEGER NOT NULL DEFAULT 0,
  wins INTEGER DEFAULT 0,
  dropouts INTEGER NOT NULL DEFAULT 0,
  saves INTEGER DEFAULT 0,
  color_theme VARCHAR(15),
  logged_in BOOLEAN,
  display_presence BOOLEAN NOT NULL DEFAULT false,
  site_admin BOOLEAN NOT NULL DEFAULT false,
  real_name VARCHAR(32),
  display_real_name BOOLEAN DEFAULT false,
  PRIMARY KEY(user_id)
);

\echo 'Attempting to create providers table'
CREATE TABLE IF NOT EXISTS providers(
  provider_id SERIAL,
  user_id INTEGER NOT NULL,
  uid VARCHAR(1024) NOT NULL,
  provider_type VARCHAR(15) NOT NULL,
  display_name VARCHAR(64),
  email VARCHAR(50),
  email_verified BOOLEAN,
  verification_deadline TIMESTAMP,
  creation_time TIMESTAMP NOT NULL,
  last_sign_in_time TIMESTAMP NOT NULL,
  photo_url VARCHAR(1024),
  PRIMARY KEY(provider_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create user_ratings table'
CREATE TABLE IF NOT EXISTS user_ratings(
  user_rating_id SERIAL,
  rated_user_id INTEGER NOT NULL,
  rating_user_id INTEGER NOT NULL,
  user_rating INTEGER NOT NULL,
  rating_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(user_rating_id),
  FOREIGN KEY(rated_user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(rating_user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create user_relationships table'
CREATE TABLE IF NOT EXISTS user_relationships(
  user_relationship_id SERIAL,
  user_id INTEGER NOT NULL,
  related_user_id INTEGER NOT NULL,
  relationship_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(user_relationship_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(related_user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create watched_countries table'
CREATE TABLE IF NOT EXISTS watched_countries(
  watched_country_id SERIAL,
  user_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  watched BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY(watched_country_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create user_reports table'
CREATE TABLE IF NOT EXISTS user_reports(
  report_id SERIAL,
  reporting_user_id INTEGER NOT NULL,
  reported_user_id INTEGER,
  incident_game_id INTEGER,
  incident_type VARCHAR(50),
  incident_description VARCHAR(1024),
  PRIMARY KEY(report_id),
  FOREIGN KEY(reporting_user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(reported_user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create assignments table'
CREATE TABLE IF NOT EXISTS assignments(
  assignment_id SERIAL,
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  country_id INTEGER,
  assignment_type VARCHAR(15) NOT NULL,
  assignment_start TIMESTAMP NOT NULL,
  assignment_end TIMESTAMP,
  nmr_count INTEGER,
  PRIMARY KEY(assignment_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create message_groups table'
CREATE TABLE IF NOT EXISTS message_groups(
  message_group_id SERIAL,
  message_group_name VARCHAR(25),
  PRIMARY KEY(message_group_id)
);

\echo 'Attempting to create message_group_members table'
CREATE TABLE IF NOT EXISTS message_group_members(
  message_group_member_id SERIAL,
  message_group_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  PRIMARY KEY(message_group_member_id),
  FOREIGN KEY(message_group_id)
    REFERENCES message_groups(message_group_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create messages table'
CREATE TABLE IF NOT EXISTS messages(
  message_id SERIAL,
  sending_user_id INTEGER,
  receiving_user_id INTEGER,
  sending_country_id INTEGER,
  receiving_country_id INTEGER,
  message_group_id INTEGER,
  body VARCHAR NOT NULL,
  time_sent TIMESTAMP NOT NULL,
  message_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(message_id),
  FOREIGN KEY(sending_user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(receiving_user_id)
    REFERENCES users(user_id),
  FOREIGN KEY(sending_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(sending_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(receiving_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(message_group_id)
    REFERENCES message_groups(message_group_id)
);

\echo 'Attempting to create message_read_receipts table'
CREATE TABLE IF NOT EXISTS message_read_receipts(
  message_read_receipt_id SERIAL,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message_read BOOLEAN NOT NULL,
  PRIMARY KEY(message_read_receipt_id),
  FOREIGN KEY(message_id)
    REFERENCES messages(message_id),
  FOREIGN KEY(user_id)
    REFERENCES users(user_id)
);

\echo 'Attempting to create order_options table'
CREATE TABLE IF NOT EXISTS order_options(
  order_option_id SERIAL,
  unit_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  secondary_unit_id INTEGER,
  destination_choices INTEGER [] NOT NULL,
  order_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(order_option_id),
  FOREIGN KEY(unit_id)
    REFERENCES units(unit_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(secondary_unit_id)
    REFERENCES units(unit_id)
);

\echo 'Attempting to create mad_conditions table'
CREATE TABLE IF NOT EXISTS mad_conditions(
  mad_condition_id SERIAL,
  issuing_country_id INTEGER NOT NULL,
  launching_country_id INTEGER NOT NULL,
  targeted_country_id INTEGER NOT NULL,
  condition_priority INTEGER NOT NULL,
  PRIMARY KEY(mad_condition_id),
  FOREIGN KEY(issuing_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(launching_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(targeted_country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create order_sets table'
CREATE TABLE IF NOT EXISTS order_sets(
  order_set_id SERIAL,
  country_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  message_id INTEGER,
  submission_time TIMESTAMP NOT NULL,
  order_set_type VARCHAR(15) NOT NULL,
  order_set_name VARCHAR(25),
  mad_condition_id INTEGER,
  PRIMARY KEY(order_set_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(message_id)
    REFERENCES messages(message_id),
  FOREIGN KEY(mad_condition_id)
    REFERENCES mad_conditions(mad_condition_id)
);

\echo 'Attempting to create orders table'
CREATE TABLE IF NOT EXISTS orders(
  order_id SERIAL,
  order_set_id INTEGER NOT NULL,
  order_type VARCHAR(15) NOT NULL,
  ordered_unit_id INTEGER NOT NULL,
  secondary_unit_id INTEGER,
  destination_id INTEGER,
  order_status VARCHAR(15),
  order_success BOOLEAN,
  PRIMARY KEY(order_id),
  FOREIGN KEY(order_set_id)
    REFERENCES order_sets(order_set_id),
  FOREIGN KEY(ordered_unit_id)
    REFERENCES units(unit_id),
  FOREIGN KEY(secondary_unit_id)
    REFERENCES units(unit_id),
  FOREIGN KEY(destination_id)
    REFERENCES nodes(node_id)
);

\echo 'End of script'