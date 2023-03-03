export const getAtRiskUnitsQuery = `
  WITH last_country_history_id AS (
    SELECT ch.country_id,
      ch.turn_id,
      MAX(t.turn_number) AS turn_number
    FROM country_histories ch
    INNER JOIN turns t ON t.turn_id = ch.turn_id
    WHERE t.turn_number <= $1
    GROUP BY ch.country_id,
      ch.turn_id
  )
  SELECT u.unit_id,
    u.unit_type,
    p.province_name,
    n.loc
  FROM last_country_history_id lchi
  INNER JOIN country_histories ch ON ch.country_id = lchi.country_id AND ch.turn_id = lchi.turn_id
  INNER JOIN units u ON u.country_id = ch.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE ch.adjustments < 0
    AND CASE
      WHEN $2 != 0
      THEN ch.country_id = $2
    END
  ORDER BY p.province_name;
`;
