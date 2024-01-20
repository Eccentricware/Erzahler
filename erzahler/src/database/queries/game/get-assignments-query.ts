export const getAssignmentsQuery = `
  SELECT
	  c.country_id,
    c.country_name,
    c.rank,
	  CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status IN ('Playing', 'Finished', 'Abandoned', 'Paused')
      THEN u.user_id
      ELSE NULL
    END player_id,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status IN ('Playing', 'Finished', 'Abandoned', 'Paused')
      THEN u.username
      ELSE NULL
    END username,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status IN ('Playing', 'Finished', 'Abandoned', 'Paused')
      THEN a.assignment_status
      ELSE NULL
    END assignment_status,
    CASE
      WHEN ((
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status IN ('Playing', 'Finished', 'Abandoned', 'Paused'))
        AND a.country_id IS NOT NULL
      THEN json_agg(
        json_build_object(
          'preferredMethod', us.preferred_contact_method,
          'email', us.contact_email,
          'discord', us.contact_discord,
          'slack', us.contact_slack,
          'inGame', us.contact_in_game,
          'otherMethod', us.other_contact_method,
          'otherHandle', us.other_contact_handle
        )
      )
      ELSE NULL
    END contact_preferences
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  LEFT JOIN assignments a ON a.country_id = c.country_id
  LEFT JOIN users u ON u.user_id = a.user_id
  LEFT JOIN user_settings us ON us.user_id = u.user_id
  WHERE g.game_id = $1
    AND c.rank != 'n'
  GROUP BY c.country_id,
    c.country_name,
    c.rank,
    g.game_status,
    u.user_id,
    u.username,
    a.assignment_status,
    a.country_id
  ORDER BY c.rank, c.country_name;
`;
