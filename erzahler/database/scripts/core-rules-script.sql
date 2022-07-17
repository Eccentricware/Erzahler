--sudo -u postgres psql < database/schema/core-rules-script.sql

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'untf',
  'United Nations Task Force',
  'Players vote on an action to support or vacant province to hold'
);

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'madOrders',
  'MAD Orders',
  'Players can order nukes (and only nukes) conditionally. These react to foreign nukes (and only foreign nukes) being launched.'
);

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'blindAdmins',
  'Blind Game Admins',
  'Game administrators will not be able to see the player orders come in real-time. This allows for administrators to join the game, removing their special spectator advantage.'
);

INSERT INTO rules (rule_key, rule_name, rule_description) VALUES (
  'partialRosterStart',
  'Partial Roster Start',
  'If a specific start time is scheduled, the game will automatically start based upon who is assigned at the time. If the rule is not enabled, the start time will continually be delayed based on schedule type.'
);