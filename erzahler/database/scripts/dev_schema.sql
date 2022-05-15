DROP DATABASE IF EXISTS erzahler_dev;
CREATE DATABASE erzahler_dev;

\c erzahler_dev;

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
  order_deadline DateTime,
  retreat_deadline DateTime,
  adjustment_deadline DateTime,
  nomination_deadline DateTime,
  vote_deadline DateTime,
  double_first_turn BOOLEAN,
  nmr_removal INTEGER,
  partial_roster_start INTEGER,
  delay_lock INTEGER
  PRIMARY KEY(game_id)
);

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

CREATE TABLE IF NOT EXISTS turns(
  turn_id SERIAL,
  game_id INTEGER NOT NULL,
  deadline DateTime NOT NULL,
  turn_number INTEGER NOT NULL,
  turn_name VARCHAR(50),
  turn_type VARCHAR(10) NOT NULL,
  turn_status VARCHAR(15) NOT NULL,
  PRIMARY KEY(turn_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

CREATE TABLE IF NOT EXISTS provinces(
  province_id SERIAL,
  game_id INTEGER NOT NULL,
  province_name VARCHAR(15) NOT NULL,
  province_fullname VARCHAR(25),
  province_type VARCHAR(15) NOT NULL,
  vote_type VARCHAR(15),
  PRIMARY KEY(province_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id),
  FOREIGN KEY(controller_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(capital_owner_id)
    REFERENCES countries(country_id)
);

CREATE TABLE IF NOT EXISTS terrain(
  terrain_id SERIAL,
  province_id INTEGER NOT NULL,
  render_category VARCHAR NOT NULL,
  points VARCHAR(MAX) NOT NULL,
  top_bound INTEGER NOT NULL,
  left_bound INTEGER NOT NULL,
  right_bound INTEGER NOT NULL,
  bottom_bound INTEGER NOT NULL,
  PRIMARY KEY(terrain_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

CREATE TABLE IF NOT EXISTS bridges(
  bridge_id SERIAL,
  points VARCHAR(MAX) NOT NULL,
  start_province INTEGER NOT NULL,
  end_province INTEGER NOT NULL,
  PRIMARY KEY(bridge_id),
  FOREIGN KEY(start_province)
    REFERENCES provinces(province_id),
  FOREIGN KEY(end_province)
    REFERENCES provinces(province_id)
);

CREATE TABLE IF NOT EXISTS labels(
  label_id SERIAL,
  province_id INTEGER NOT NULL,
  loc INTEGER [] NOT NULL
  label_text VARCHAR(10),
  PRIMARY KEY(label_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

CREATE TABLE IF NOT EXISTS countries(
  country_id SERIAL,
  game_id INTEGER NOT NULL,
  country_name VARCHAR(50) NOT NULL,
  rank VARCHAR(1) NOT NULL,
  color VARCHAR(7) NOT NULL,
  flag_key VARCHAR(20) NOT NULL,
  region VARCHAR(15)
  PRIMARY KEY(country_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id)
);

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
  FOREIGN KEY(controller_id)
    REFERENCES countries(country_id),
  FOREIGN KEY(capital_owner_id)
    REFERENCES countries(country_id)
);

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

CREATE TABLE IF NOT EXISTS nodes(
  node_id SERIAL,
  province_id INTEGER NOT NULL,
  node_type VARCHAR(4) NOT NULL,
  loc INTEGER [] NOT NULL,
  PRIMARY KEY(node_id),
  FOREIGN KEY(province_id)
    REFERENCES provinces(province_id)
);

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

CREATE TABLE IF NOT EXISTS nominations(
  nomination_id SERIAL,
  turn_id INTEGER NOT NULL,
  nominator_id INTEGER NOT NULL,
  nomination_type VARCHAR(15) NOT NULL,
  country_1_id INTEGER,
  country_2_id INTEGER,
  country_3_id INTEGER,
  deadline DateTime NOT NULL,
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

CREATE TABLE IF NOT EXISTS votes(
  vote_id SERIAL,
  nomination_id INTEGER NOT NULL,
  voting_country_id INTEGER NOT NULL,
  vote VARCHAR(10) NOT NULL
  PRIMARY KEY(vote_id),
  FOREIGN KEY(nomination_id)
    REFERENCES nominations(nomination_id),
  FOREIGN KEY(voting_country_id)
    REFERENCES countries(country_id)
);

CREATE TABLE IF NOT EXISTS units(
  unit_id SERIAL,
  country_id INTEGER NOT NULL,
  unit_type VARCHAR(10) NOT NULL,
  PRIMARY KEY(unit_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

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

CREATE TABLE IF NOT EXISTS players(
  player_id SERIAL,
  firebase_id VARCHAR(32) NOT NULL,
  username VARCHAR(15) NOT NULL,
  signup_date DateTime NOT NULL,
  last_login DateTime NOT NULL,
  player_status VARCHAR(15) NOT NULL,
  time_zone VARCHAR(25),
  nmr_count INTEGER,
  wins INTEGER,
  dropouts INTEGER,
  saves INTEGER,
  color_theme VARCHAR(15),
  PRIMARY KEY(player_id)
);

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

CREATE TABLE IF NOT EXISTS assignments(
  assignment_id SERIAL,
  player_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  country_id INTEGER,
  assignment_type VARCHAR(15) NOT NULL,
  assignment_start DateTime NOT NULL,
  assignment_end DateTime,
  nmr_count INTEGER,
  PRIMARY KEY(assignment_id),
  FOREIGN KEY(player_id)
    REFERENCES players(player_id),
  FOREIGN KEY(game_id)
    REFERENCES games(game_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

CREATE TABLE IF NOT EXISTS message_groups(
  message_group_id SERIAL,
  message_group_name VARCHAR(25),
  PRIMARY KEY(message_group_id)
);

CREATE TABLE IF NOT EXISTS message_group_members(
  group_member_id SERIAL,
  group_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  PRIMARY KEY(group_member_id),
  FOREIGN KEY(group_id)
    REFERENCES groups(group_id),
  FOREIGN KEY(country_id)
    REFERENCES countries(country_id)
);

CREATE TABLE IF NOT EXISTS messages(
  message_id SERIAL,
  sending_player_id INTEGER,
  receiving_player_id INTEGER,
  sending_country_id INTEGER,
  receiving_country_id INTEGER,
  message_group_id INTEGER,
  body VARCHAR(MAX) NOT NULL,
  time_sent DateTime NOT NULL,
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

CREATE TABLE IF NOT EXISTS order_sets(
  order_set_id SERIAL,
  country_id INTEGER NOT NULL,
  turn_id INTEGER NOT NULL,
  message_id INTEGER,
  submission_time DateTime NOT NULL,
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