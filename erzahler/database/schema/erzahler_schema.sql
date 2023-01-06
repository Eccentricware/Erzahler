--sudo -u postgres psql < database/schema/erzahler_schema.sql

DROP DATABASE IF EXISTS erzahler_dev;
CREATE DATABASE erzahler_dev;

\c erzahler_dev;
\echo 'Attempting to set time zone to utc'
SET TIME ZONE 'utc';

\echo 'Attempting to create games table'

CREATE TABLE IF NOT EXISTS games(
  game_id SERIAL,
  game_name VARCHAR(50) UNIQUE NOT NULL,
  time_created TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
  time_ready TIMESTAMP NULL,
  ready_to_start BOOLEAN NOT NULL DEFAULT false,
  game_status VARCHAR(25) NOT NULL,
  current_year INTEGER NOT NULL,
  stylized_start_year INTEGER NOT NULL DEFAULT 2000,
  concurrent_games_limit INTEGER,
  private_game BOOLEAN DEFAULT false,
  hidden_game BOOLEAN DEFAULT false,
  blind_administrators BOOLEAN DEFAULT false,
  assignment_method VARCHAR(15) NOT NULL,
  deadline_type VARCHAR(15),
  observe_dst BOOLEAN DEFAULT true,
  turn_1_timing VARCHAR(10) NOT NULL,
  start_time TIMESTAMP,
  orders_day VARCHAR(9),
  orders_time TIME,
  orders_span INTEGER,
  retreats_day VARCHAR(9),
  retreats_time TIME,
  retreats_span INTEGER,
  adjustments_day VARCHAR(9),
  adjustments_time TIME,
  adjustments_span INTEGER,
  nominations_day VARCHAR(9),
  nominations_time TIME,
  nominations_span INTEGER,
  votes_day VARCHAR(9),
  votes_time TIME,
  votes_span INTEGER,
  nominate_during_adjustments BOOLEAN DEFAULT false,
  vote_during_spring BOOLEAN DEFAULT false,
  nmr_tolerance_total INTEGER,
  nmr_tolerance_orders INTEGER,
  nmr_tolerance_retreats INTEGER,
  nmr_tolerance_adjustments INTEGER,
  original_schedule BOOLEAN DEFAULT true,
  vote_delay_enabled BOOLEAN DEFAULT false,
  vote_delay_lock INTEGER, --Minutes before the deadline until can't delay
  vote_delay_percent INTEGER, --Percent of players required to pass vote
  vote_delay_count INTEGER, --Number of players required to pass vote
  vote_delay_display_percent INTEGER, --Percent of players voting yes before public
  vote_delay_display_count INTEGER, --Count of players voting yes before public
  confirmation_time INTEGER, --How many minutes players have for final play confirmation. 0 waits indefinitely. Null is auto-accept.
  partial_roster_start BOOLEAN NOT NULL DEFAULT false,
  final_readiness_check BOOLEAN NOT NULL DEFAULT true,
  nomination_timing VARCHAR(25),
  nomination_year INTEGER,
  automatic_assignments BOOLEAN DEFAULT false,
  rating_limits_enabled BOOLEAN DEFAULT false,
  fun_min INTEGER,
  fun_max INTEGER,
  skill_min INTEGER,
  skill_max INTEGER,
  PRIMARY KEY(game_id)
);

\echo 'Attempting to create coalition_schedules table'
CREATE TABLE IF NOT EXISTS coalition_schedules(
  coalition_schedule_id SERIAL,
  game_id INTEGER NOT NULL,
  base_percent INTEGER DEFAULT 50, -- Math.floor(n * 100/[50]) + 1
  base_adjust INTEGER DEFAULT 1,   -- Math.floor(n * 100/50) + [1]
  base_final INTEGER, -- Counts from provinces table
  total_possible INTEGER,
  penalty_a INTEGER DEFAULT 9,
  penalty_b INTEGER DEFAULT 6,
  penalty_c INTEGER DEFAULT 3,
  penalty_d INTEGER DEFAULT 1,
  penalty_e INTEGER DEFAULT 0,
  penalty_f INTEGER DEFAULT NULL,
  penalty_g INTEGER DEFAULT NULL,
  highest_ranked VARCHAR(3) DEFAULT 'ABB',
  highest_ranked_req INTEGER,
  all_votes_controlled BOOLEAN DEFAULT false,
  PRIMARY KEY (coalition_schedule_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create rules table'
CREATE TABLE IF NOT EXISTS rules(
  rule_id SERIAL,
  rule_key VARCHAR(50) NOT NULL,
  rule_name VARCHAR(50) NOT NULL,
  rule_description TEXT,
  PRIMARY KEY(rule_id)
);

\echo 'Attempting to create rules_in_games table'
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
  turn_number INTEGER NOT NULL,
  year_number INTEGER NOT NULL DEFAULT 0,
  turn_name VARCHAR(50),
  turn_type VARCHAR(23) NOT NULL,
  turn_status VARCHAR(15) NOT NULL,
  deadline TIMESTAMP NOT NULL,
  resolved_time TIMESTAMP,
  deadline_missed BOOLEAN,
  defaults_ready BOOLEAN DEFAULT false,
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

\echo 'Attempting to create country_histories table'
CREATE TABLE IF NOT EXISTS country_histories(
  country_history_id SERIAL,
  country_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  country_status VARCHAR(15) NOT NULL,
  city_count INTEGER NOT NULL,
  unit_count INTEGER NOT NULL,
  banked_builds INTEGER NOT NULL,
  nuke_range INTEGER,
  adjustments INTEGER NOT NULL,
  PRIMARY KEY(country_history_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id)
);



\echo 'Attempting to create alerts table'
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

\echo 'Attempting to create alert_read_receipts table'
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
  city_loc INTEGER[],
  PRIMARY KEY(province_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

\echo 'Attempting to create terrain table'
CREATE TABLE IF NOT EXISTS terrain(
  terrain_id SERIAL,
  province_id INTEGER NOT NULL,
  terrain_type VARCHAR(15) NOT NULL,
  render_category VARCHAR(15) NOT NULL,
  points VARCHAR NOT NULL,
  bridge_start_province_id INTEGER,
  bridge_end_province_id INTEGER,
  top_bound INTEGER NOT NULL,
  left_bound INTEGER NOT NULL,
  right_bound INTEGER NOT NULL,
  bottom_bound INTEGER NOT NULL,
  PRIMARY KEY(terrain_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id),
  FOREIGN KEY(bridge_start_province_id)
    REFERENCES provinces(province_id),
  FOREIGN KEY(bridge_end_province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create labels table'
CREATE TABLE IF NOT EXISTS labels(
  label_id SERIAL,
  province_id INTEGER NOT NULL,
  label_name VARCHAR(13),
  label_type VARCHAR(10),
  loc INTEGER [] NOT NULL,
  label_text VARCHAR(13),
  fill VARCHAR(21),
  PRIMARY KEY(label_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create label_lines table'
CREATE TABLE IF NOT EXISTS label_lines( -- NOT USED?!
  label_line_id SERIAL,
  province_id INTEGER NOT NULL,
  label_line_name VARCHAR(20) NOT NULL,
  x1 INTEGER NOT NULL,
  x2 INTEGER NOT NULL,
  y1 INTEGER NOT NULL,
  y2 INTEGER NOT NULL,
  stroke VARCHAR(15),
  PRIMARY KEY(label_line_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

\echo 'Attempting to create province_histories table'
CREATE TABLE IF NOT EXISTS province_histories(
  province_history_id SERIAL,
  province_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  controller_id INTEGER,
  capital_owner_id INTEGER,
  province_status VARCHAR NOT NULL,
  valid_retreat BOOLEAN NOT NULL DEFAULT true,
  vote_color VARCHAR(10),
  status_color VARCHAR(10),
  stroke_color VARCHAR(10) DEFAULT 'black',
  PRIMARY KEY(province_history_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(controller_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(capital_owner_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create nodes table'
CREATE TABLE IF NOT EXISTS nodes(
  node_id SERIAL,
  province_id INTEGER NOT NULL,
  node_name VARCHAR(15) NOT NULL,
  node_type VARCHAR(5) NOT NULL,
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
  rank_signature VARCHAR(3) NOT NULL,
  votes_required INTEGER NOT NULL,
  PRIMARY KEY(nomination_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(nominator_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create countries_in_nominations table'
CREATE TABLE IF NOT EXISTS countries_in_nominations(
  country_in_nomination_id SERIAL,
  nomination_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  PRIMARY KEY(country_in_nomination_id),
  FOREIGN KEY(nomination_id)
    REFERENCES nominations(nomination_id),
  FOREIGN KEY(country_id)
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
  unit_name VARCHAR(100) NOT NULL,
  unit_type VARCHAR(10) NOT NULL,
  PRIMARY KEY(unit_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create unit_histories table'
CREATE TABLE IF NOT EXISTS unit_histories(
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
  signup_time TIMESTAMP NOT NULL,
  time_zone VARCHAR(50) NOT NULL DEFAULT 'America/Los_Angeles',
  meridiem_time BOOLEAN DEFAULT true, --true: AM/PM, false: 24 hour
  last_sign_in_time TIMESTAMP NOT NULL,
  classic_unit_render BOOLEAN NOT NULL DEFAULT false,
  city_render_size INTEGER NOT NULL DEFAULT 2,
  label_render_size INTEGER NOT NULL DEFAULT 2,
  unit_render_size INTEGER NOT NULL DEFAULT 2,
  wins INTEGER DEFAULT 0,
  nmr_total INTEGER NOT NULL DEFAULT 0,
  nmr_orders INTEGER NOT NULL DEFAULT 0,
  nmr_retreats INTEGER NOT NULL DEFAULT 0,
  nmr_adjustments INTEGER NOT NULL DEFAULT 0,
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
  assignment_status VARCHAR(25) NOT NULL,
  assignment_start TIMESTAMP NOT NULL,
  assignment_end TIMESTAMP,
  locked BOOLEAN DEFAULT false,
  nmr_total INTEGER,
  nmr_orders INTEGER,
  nmr_retreats INTEGER,
  nmr_adjustments INTEGER,
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
  turn_id INTEGER NOT NULL,
  unit_id INTEGER NOT NULL,
  order_type VARCHAR(15) NOT NULL,
  secondary_unit_id INTEGER,
  secondary_order_type VARCHAR(15),
  destinations INTEGER[],
  PRIMARY KEY(order_option_id),
  FOREIGN KEY(unit_id)
    REFERENCES units(unit_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(secondary_unit_id)
    REFERENCES units(unit_id)
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
  default_orders DEFAULT true,
  PRIMARY KEY(order_set_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id),
  FOREIGN KEY(message_id)
    REFERENCES messages(message_id)
);

\echo 'Attempting to create orders table'
CREATE TABLE IF NOT EXISTS orders(
  order_id SERIAL,
  order_set_id INTEGER,
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

\echo 'Attempting to create mad_conditions table'
CREATE TABLE IF NOT EXISTS mad_conditions(
  mad_condition_id SERIAL,
  order_set_id INTEGER NOT NULL,
  issuing_country_id INTEGER NOT NULL,
  launching_country_id INTEGER NOT NULL,
  targeted_country_id INTEGER NOT NULL,
  condition_priority INTEGER NOT NULL,
  PRIMARY KEY(mad_condition_id),
  FOREIGN KEY(order_set_id)
    REFERENCES order_sets(order_set_id),
  FOREIGN KEY(issuing_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(launching_country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(targeted_country_id)
    REFERENCES countries(country_id)
);

\echo 'Attempting to create indices'
CREATE INDEX coalition_game_idx ON coalition_schedules(game_id);
CREATE INDEX rule_in_game_core_idx ON rules_in_games(rule_id);
CREATE INDEX rule_in_game_game_idx ON rules_in_games(game_id);
CREATE INDEX turn_game_idx ON turns(game_id);
CREATE INDEX country_game_idx ON countries (game_id);
CREATE INDEX country_history_core_idx ON country_histories(country_id);
CREATE INDEX alert_game_idx ON alerts(game_id);
CREATE INDEX alert_read_receipt_core_idx ON alert_read_receipts(alert_id);
CREATE INDEX alert_read_receipt_country_idx ON alert_read_receipts(country_id);
CREATE INDEX province_game_idx ON provinces(game_id);
CREATE INDEX terrain_province_idx ON terrain(province_id);
CREATE INDEX terrain_bridge_start_idx ON terrain(province_id);
CREATE INDEX terrain_bridge_end_idx ON terrain(province_id);
CREATE INDEX label_province_idx ON labels(province_id);
CREATE INDEX label_line_province_idx ON label_lines(province_id); -- No label lines in use
CREATE INDEX province_history_core_idx ON province_histories(province_id);
CREATE INDEX province_history_turn_idx ON province_histories(turn_id);
CREATE INDEX province_history_controller_idx ON province_histories(controller_id);
CREATE INDEX province_history_capital_owner_idx ON province_histories(capital_owner_id);
CREATE INDEX node_province_idx ON nodes(province_id);
CREATE INDEX node_adjacency_core_1_idx ON node_adjacencies(node_1_id);
CREATE INDEX node_adjacency_core_2_idx ON node_adjacencies(node_2_id);
CREATE INDEX nomination_turn_idx ON nominations(turn_id);
CREATE INDEX nomination_core_idx ON countries_in_nominations(nomination_id);
CREATE INDEX nomination_country_idx ON countries_in_nominations(country_id);
CREATE INDEX vote_nomination_idx ON votes(nomination_id);
CREATE INDEX vote_country_idx ON votes(voting_country_id);
CREATE INDEX unit_country_idx ON units(country_id);
CREATE INDEX unit_history_core_idx ON unit_histories(unit_id);
CREATE INDEX unit_history_turn_idx ON unit_histories(turn_id);
CREATE INDEX unit_history_node_idx ON unit_histories(node_id);
CREATE INDEX provider_user_idx ON providers(user_id);
CREATE INDEX ratings_rated_idx ON user_ratings(rated_user_id);
CREATE INDEX ratings_rating_idx ON user_ratings(rating_user_id);
CREATE INDEX user_relationships_core_idx ON user_relationships(user_id);
CREATE INDEX user_relationships_related_idx ON user_relationships(related_user_id);
CREATE INDEX watched_country_user_idx ON watched_countries(user_id);
CREATE INDEX watched_country_country_idx ON watched_countries(country_id);
CREATE INDEX user_report_reporting_idx ON user_reports(reporting_user_id);
CREATE INDEX user_report_reported_idx ON user_reports(reported_user_id);
CREATE INDEX assignment_user_idx ON assignments(user_id);
CREATE INDEX assignment_game_idx ON assignments(game_id);
CREATE INDEX assignment_country_idx ON assignments(country_id);
CREATE INDEX message_group_member_group_idx ON message_group_members(message_group_id);
CREATE INDEX message_group_member_country_idx ON message_group_members(country_id);
CREATE INDEX message_sending_user_idx ON messages(sending_user_id);
CREATE INDEX message_receiving_user_idx ON messages(receiving_user_id);
CREATE INDEX message_sending_country_idx ON messages(sending_country_id);
CREATE INDEX message_receiving_country_idx ON messages(receiving_country_id);
CREATE INDEX message_group_idx ON messages(message_group_id);
CREATE INDEX message_read_receipt_core_idx ON message_read_receipts(message_id);
CREATE INDEX message_read_receipt_user_idx ON message_read_receipts(user_id);
CREATE INDEX order_option_unit_idx ON order_options(unit_id);
CREATE INDEX order_option_turn_idx ON order_options(turn_id);
CREATE INDEX order_option_secondary_idx ON order_options(secondary_unit_id);
CREATE INDEX order_set_country_idx ON order_sets(country_id);
CREATE INDEX order_set_turn_idx ON order_sets(turn_id);
CREATE INDEX order_set_message_idx ON order_sets(message_id);
CREATE INDEX order_set_idx ON orders(order_set_id);
CREATE INDEX order_unit_idx ON orders(ordered_unit_id);
CREATE INDEX order_secondary_idx ON orders(secondary_unit_id);
CREATE INDEX order_destination_idx ON orders(destination_id);
CREATE INDEX mad_condition_order_set_idx ON mad_conditions(order_set_id);
CREATE INDEX mad_condition_issuing_idx ON mad_conditions(issuing_country_id);
CREATE INDEX mad_condition_launched_idx ON mad_conditions(launching_country_id);
CREATE INDEX mad_condition_targeted_idx ON mad_conditions(targeted_country_id);