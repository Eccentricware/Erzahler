--sudo -u postgres psql < database/scripts/dev_schema.sql

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
  blind_administrator BOOLEAN,
  private_game BOOLEAN,
  hidden_game BOOLEAN,
  order_deadline TIMESTAMP,
  retreat_deadline TIMESTAMP,
  adjustment_deadline TIMESTAMP,
  nomination_deadline TIMESTAMP,
  vote_deadline TIMESTAMP,
  double_first_turn BOOLEAN,
  nmr_removal INTEGER,
  partial_roster_start INTEGER,
  delay_lock INTEGER,
  PRIMARY KEY(game_id)
);

\echo 'Attempting to create rulesets table'
CREATE TABLE IF NOT EXISTS rulesets(
  ruleset_id SERIAL,
  game_id INTEGER,
  anonymous_play BOOLEAN,
  dynamic_vote_start BOOLEAN,
  fog_of_war BOOLEAN,
  mad_orders BOOLEAN,
  un_fast_force BOOLEAN,
  PRIMARY KEY(ruleset_id),
  FOREIGN key(game_id)
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
  nuke_range INTEGER NOT NULL,
  adjustments INTEGER NOT NULL,
  PRIMARY KEY(country_history_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(turn_id)
    REFERENCES turns(turn_id)
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

\echo 'Attempting to create players table'
CREATE TABLE IF NOT EXISTS players(
  player_id SERIAL,
  firebase_id VARCHAR(32) NOT NULL,
  username VARCHAR(15) NOT NULL,
  signup_date TIMESTAMP NOT NULL,
  last_login TIMESTAMP NOT NULL,
  player_status VARCHAR(15) NOT NULL,
  time_zone VARCHAR(25),
  nmr_count INTEGER,
  wins INTEGER,
  dropouts INTEGER,
  saves INTEGER,
  color_theme VARCHAR(15),
  PRIMARY KEY(player_id)
);

\echo 'Attempting to create player_ratings table'
CREATE TABLE IF NOT EXISTS player_ratings(
  player_rating_id SERIAL,
  rated_player_id INTEGER NOT NULL,
  rating_player_id INTEGER NOT NULL,
  player_rating INTEGER NOT NULL,
  rating_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(player_rating_id),
  FOREIGN KEY(rated_player_id)
    REFERENCES players(player_id),
  FOREIGN KEY(rating_player_id)
    REFERENCES players(player_id)
);

\echo 'Attempting to create player_relationships table'
CREATE TABLE IF NOT EXISTS player_relationships(
  player_relationship_id SERIAL,
  player_id INTEGER NOT NULL,
  related_player_id INTEGER NOT NULL,
  relationship_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(player_relationship_id),
  FOREIGN KEY(player_id)
    REFERENCES players(player_id),
  FOREIGN KEY(related_player_id)
    REFERENCES players(player_id)
);

\echo 'Attempting to create assignments table'
CREATE TABLE IF NOT EXISTS assignments(
  assignment_id SERIAL,
  player_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  country_id INTEGER,
  assignment_type VARCHAR(15) NOT NULL,
  assignment_start TIMESTAMP NOT NULL,
  assignment_end TIMESTAMP,
  nmr_count INTEGER,
  PRIMARY KEY(assignment_id),
  FOREIGN KEY(player_id)
    REFERENCES players(player_id),
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
  sending_player_id INTEGER,
  receiving_player_id INTEGER,
  sending_country_id INTEGER,
  receiving_country_id INTEGER,
  message_group_id INTEGER,
  body VARCHAR NOT NULL,
  time_sent TIMESTAMP NOT NULL,
  message_type VARCHAR(15) NOT NULL,
  PRIMARY KEY(message_id),
  FOREIGN KEY(sending_player_id)
    REFERENCES players(player_id),
  FOREIGN KEY(receiving_player_id)
    REFERENCES players(player_id),
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
  player_id INTEGER NOT NULL,
  message_read BOOLEAN NOT NULL,
  PRIMARY KEY(message_read_receipt_id),
  FOREIGN KEY(message_id)
    REFERENCES messages(message_id),
  FOREIGN KEY(player_id)
    REFERENCES players(player_id)
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

\echo 'Attempting to create order_sets table'
CREATE TABLE IF NOT EXISTS order_sets(
  order_set_id SERIAL,
  country_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  message_id INTEGER,
  submission_time TIMESTAMP NOT NULL,
  order_set_type VARCHAR(15) NOT NULL,
  order_set_name VARCHAR(25),
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
  order_set_id INTEGER NOT NULL,
  order_type VARCHAR(15) NOT NULL,
  order_status VARCHAR(15) NOT NULL,
  ordered_unit_id INTEGER NOT NULL,
  secondary_unit_id INTEGER,
  destination_id INTEGER,
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