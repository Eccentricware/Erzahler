--sudo -u postgres psql < database/scripts/insert-core-rules.sql

\c erzahler_dev;
\echo 'Attempting to add core rules'

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'madOrders',
  'MAD Orders',
  'Players can order nukes (and only nukes) conditionally. These react to foreign nukes (and only foreign nukes) being launched.'
);

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'untf',
  'United Nations Task Force',
  'Players vote on an action to support or vacant province to hold'
);

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'anonymousPlay',
  'Anonymous Play',
  'Players communicate through in-game chat that does not display any player-specific information'
);
